var WxParse = require('../../wxParse/wxParse.js');
var util = require('../../utils/util.js');

Page({
  data: {
    weiboId: '',
    state:'weibo',
    weiboDetail: '',
    time:''
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      weiboId: options.weiboId,
      state: options.state
    })
    that.getWeiboDetail();
  },
  onShareAppMessage(res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.weiboDetail.uname + '-美股直播详情',
      path: '/pages/weiboDetail/weiboDetail?weiboId=' + that.data.weiboId + '&state=' + (that.data.state == 'viewpoint' ? 'viewpoint' :'weibo')
    }
  },
  getWeiboDetail: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://www.imaibo.net/index.php?app=wch&act=detail&reqfrom=1',
      data: {
        mod: that.data.state,
        weibo_id: that.data.weiboId,
      },
      success(res) {
        var d = res.data;
        if(d.code==0){
          var dData = '';
          var time = ''
          if (that.data.state =='viewpoint'){
            dData = d.data.article;
            time = dData.time;
          }else{
            dData = d.data;
            time = dData.ctime;
          }
     
          var nowDate = new Date();
          nowDate.setTime(time * 1000);
          that.setData({
            weiboDetail: dData,
            time: util.formatTime(nowDate)
          })
          wx.setNavigationBarTitle({
            title: dData.uname + '-美股直播详情'
          })
          WxParse.wxParse('article', 'html', (dData.content ? dData.content : dData.vip_expire_text), that, 5);
        }
        wx.hideLoading();
      }
    })
  }
})
