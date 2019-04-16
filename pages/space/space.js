var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    uid: '',
    listState: 1,
    dynamicMaxId:0,
    author:'',
    dynamic:'',
    dynamic2:'',
    page:0
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      uid: options.uid
    })
    that.getListInfo();
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
        //  console.log(that.data.scrollHeight)
      }
    });
    console.log(that.route)
  },
  onShareAppMessage(res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.author.uname+'-美股直播',
      path: '/pages/space/space?uid='+that.data.author.uid
    }
  },
  getListInfo: function (uid) {
    var that = this;
    if (that.data.listState != 1) {
      return false;
    }
    that.setData({
      listState: 2
    })
    if (that.data.listState==2){
      wx.showLoading({
        title: '加载中',
      })
    }
    wx.request({
      url: 'https://www.imaibo.net/index.php?app=wch&mod=weibo&act=index',
      data: {
        uid: that.data.uid,
        max_id: that.data.dynamicMaxId
      },
      success(res) {
        var d = res.data.data;

        if (d.list.length > 0) {
         
          if (that.data.dynamicMaxId==0){
            that.setData({
              author: d.author,
              dynamic: d.list,
              dynamic2: d.list,
              listState: 1,
              dynamicMaxId: d.list[d.list.length - 1].weibo_id,
            })
            wx.setNavigationBarTitle({
              title: d.author.uname +'-美股直播'
            })
          }else{
            that.setData({
              dynamic: that.data.dynamic.concat(d.list),
              dynamic2: that.data.dynamic2.concat(d.list),
              listState: 1,
              dynamicMaxId: d.list[d.list.length - 1].weibo_id,
              page: that.data.page + 1
            })
          }
  
          for (var a in d.list) {
            if (that.data.page > 0){
              WxParse.wxParse('article' + that.data.page + a, 'html', (d.list[a].content ? d.list[a].content : '<div></div>'), that, 5);

            }else{
              WxParse.wxParse('article' + a, 'html', (d.list[a].content ? d.list[a].content : '<div></div>'), that, 5);
    
            }
            // if (a === that.data.dynamic.length - 1) {
            //   WxParse.wxParseTemArray('dynamic', 'article', that.data.dynamic.length, that)
            // }
          }
          WxParse.wxParseTemArray('dynamic', 'article', that.data.dynamic.length, that);
        } else {
          that.setData({
            listState: 3
          })
        }
        wx.hideLoading();
      }
    })
  }
})
