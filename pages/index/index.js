var WxParse = require('../../wxParse/wxParse.js');
// require('../public/public.js');
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listInfoData: [],
    listInfoData2: [],
    page:1,
    listState:1,
    scrollHeight:0,
    state:0,
    // pageUrl:''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    // wx.showActionSheet({
    //   itemList: ['A', 'B', 'C'],
    //   success: function (res) {
    //     console.log(res.tapIndex)
    //   },
    //   fail: function (res) {
    //     console.log(res.errMsg)
    //   }
    // })
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
    var that = this;
    that.getListInfo();
    wx.getSystemInfo({
       success: function(res) {
        that.setData({
            scrollHeight: res.windowHeight
        });
        //  console.log(that.data.scrollHeight)
      }      
    });
    // that.setData({
    //   pageUrl: that.route
    // });
    // console.log(that.route)
    wx.setNavigationBarTitle({
      title:'美股直播'
    })
  },
  // onReachBottom(){
  //   var that = this;
  //   that.getListInfo();
  // },
  onShareAppMessage(res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '美股直播',
      path: '/pages/index/index'
    }
  },
  getUserInfo: function(e) {
    var that = this;
    app.globalData.userInfo = e.detail.userInfo
    that.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  getListInfo:function(){
    var that = this;
    if (that.data.listState != 1) {
      return false;
    }
    that.setData({
      listState: 2
    })
    if (that.data.listState == 2) {
      wx.showLoading({
        title: '加载中',
      })
    }
    wx.request({
      url: 'https://www.imaibo.net/index.php?app=landingpage&mod=WeiBoLiveA50&act=getA50Experts', 
      data: {
        limit: 10,
        page: that.data.page
      },
      success(res) {
        var d = res.data.data;
        if (d.length>0){
          that.setData({
            listInfoData: that.data.listInfoData.concat(d),
            listInfoData2: that.data.listInfoData2.concat(d),
            listState:1
          })
          for (var a in d) {
            if (that.data.page > 1) {
              WxParse.wxParse('article' + (that.data.page - 1) + a, 'html', (d[a].wb_content ? d[a].wb_content : '<div></div>'), that, 5);
            } else {
              WxParse.wxParse('article' + a, 'html', (d[a].wb_content ? d[a].wb_content : '<div></div>'), that, 5);
            }
          }
          WxParse.wxParseTemArray('listInfoData', 'article', that.data.listInfoData.length, that);
          that.setData({
            page: that.data.page + 1,
          })
        }else{
          that.setData({
            listState: 3
          })
        }
        wx.hideLoading();
      }
    })
  }
})
