Page({
  data: {
    loadState:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfoData:'',
    showUserFormState:false,
    openid:'',
    pageUrl: ''
  },
  onLoad() {
    // 查看是否授权
    let that = this;
    that.getOpenid();
    that.setData({
      pageUrl: that.route
    });
    // console.log(that.route)
  },
  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getOpenid',
      // data: {
      //   xdp1: 1111,
      //   xdp2: 2222,
      // },
      complete: res => {
        if (res.result.openid){
          let openid = res.result.openid;
          that.setData({
            openid: openid
          })
          that.cloudUserInfo();
        }
      }
    })
  },
  onShareAppMessage(res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '分享美股直播',
      path: '/pages/index/index'
    }
  },
  // getPhoneNumber(e) {
  //   console.log(e.detail.errMsg)
  //   console.log(e.detail.iv)
  //   console.log(e.detail.encryptedData)
  // },
  cloudUserInfo(){
    let that = this;
    // const db = wx.cloud.database()
    // db.collection('imaibo').where({
    //   _id: "XBN223kPDdDCJ2b4"
    // }).get({ // get 方法会触发网络请求，往数据库取数据
    //   success: function (res) {
    //     console.log('sss', res.data)
    //   }
    // })
    if (that.data.openid){
      wx.showLoading({
        title: '加载中',
      })
    }
    const db = wx.cloud.database();
    db.collection('imaibo').where({
      _openid: that.data.openid
    }).get().then(res => {
      let d = res.data;
      if (d.length!=0){
        // wx.getSetting({
        //   success(res) {
        //     if (res.authSetting['scope.userInfo']) {
        //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        //       wx.getUserInfo({
        //         success(res) {
        //           // console.log(res.userInfo);
        //           that.setData({
        //             userInfoData: res.userInfo
        //           });
        //           console.log(that.data.openid);
                  
        //         }
        //       })
        //     }
        //   }
        // });
        that.setData({
          userInfoData: d[0]
        });
        wx.setNavigationBarTitle({
          title: that.data.userInfoData.nickName + '-个人中心'
        })
      }
      wx.hideLoading();
      that.setData({
        loadState: true
      });
    })
  },
  bindGetUserInfo(e) {
    let that = this;
    if (e.detail.userInfo){
      that.setData({
        userInfoData: e.detail.userInfo
      })
      const db = wx.cloud.database();
      db.collection('imaibo').add({
        data: {
          avatarUrl: that.data.userInfoData.avatarUrl,
          nickName: that.data.userInfoData.nickName,
        },
      })
      .then(res => {
        // console.log(res)
        that.cloudUserInfo();
      })
      .catch(console.error)
    }
  },
  showUserForm(){
    let that = this;
    that.setData({
      showUserFormState: true
    })
  },
  formSubmit(e) {
    let that = this;
    let formData = e.detail.value;
    // console.log('form发生了submit事件，携带数据为：', )
    wx.showModal({
      title: '提示',
      content: '是否确认修改用户信息？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
          })
          const db = wx.cloud.database();
          db.collection('imaibo').doc(that.data.userInfoData._id).update({
            data: {
              nickName: formData.nickName,
              // avatarUrl: that.data.userInfoData.avatarUrl,
            },
          })
            .then(res => {
              wx.hideLoading();
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 500,
                success(res){
                  setTimeout(()=>{
                    that.closeUserForm();
                    that.cloudUserInfo();
                  },600)
                }
              })
              // wx.hideToast();
            })
            .catch(console.error)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  closeUserForm(){
    let that = this;
    that.setData({
      showUserFormState: false
    })
  },
  formReset() {
    let that = this;
    console.log('form发生了reset事件');
  },
  chooseFace(){
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths);
        wx.showLoading({
          title: '上传中',
        })
        wx.cloud.deleteFile({
          fileList: [that.data.userInfoData.avatarUrl]
        }).then(res => {
          // handle success
          // console.log(res.fileList)
          wx.cloud.uploadFile({
            cloudPath: 'face' + that.data.userInfoData._openid + Math.floor(100000 * Math.random()) + '.png',
            filePath: tempFilePaths[0], // 文件路径
          }).then(res => {
            // get resource ID
            // console.log(res)
            that.setData({
              'userInfoData.avatarUrl': res.fileID
            });
            const db = wx.cloud.database();
            db.collection('imaibo').doc(that.data.userInfoData._id).update({
              data: {
                // nickName: formData.nickName,
                avatarUrl: that.data.userInfoData.avatarUrl,
              },
            })
            .then(res => {
              wx.hideLoading();
              wx.showToast({
                title: '修改头像成功',
                icon: 'success'
              })
            
            })
            .catch(console.error)
          }).catch(error => {
            // console.log(error)
            // handle error
          })
        }).catch(error => {
          // handle error
        })
      
      }
    })
  }
})