(function () {

  var pubNubSettings = {
    channels: ['mychannel']
  }

  pubNubSettings.history = {
    channel: pubNubSettings.channels[0],
    count: 20
  }

  var pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo'
  })

  var states = {
    name: '',
    msgs: []
  }

  function initPubNub() {
    pubnub.addListener ({
      message: function (data) {
        var type = data.message.name == states.name ? 'sent' : 'received'
        var name = type == 'sent' ? states.name : data.message.name
        states.msgs.push({name:name, text: data.message.text, type:type})
      }
    })

    pubnub.subscribe({
      channels: pubNubSettings.channels
    })

    pubNubSettings.history(pubNubSettings.history, function (status, response) {
      var history = response.messages
      for (var i=0; i<history.length; i++) {
        var type = history[i].entry.name == states.name ? 'send' : 'received'
        states.msgs.push({
          name: history[i].entry.name,
          text:history[i].entry.text,
          type:type
        })
      }
    })
  }

  function init () {

    Vue.use(Framework7Vue)

    Vue.component('page-chat', {
      template: '#page-chat',
      data: function () {
        return states
      },
      methods: {
        onSend: function (text, clear) {
          if (text.trim().length === 0) return;
          pubnub.publish({
            channel: pubNubSettings.channels[0],
            message: {
              text:text,
              name:this.name
            }
          })
          if (typeof clear == 'function') clear();
        }
      }
    })

    new Vue({
      el: '#app',
      data: function () {
        return states;
      },
      methods: {
        enterChat: function () {
          if (this.name.trim().length === 0) {
            alert("Please enter your name")
            return false
          }
          this.msgs.length = 0
          this.$f7.mainView.router.load({url:'/chat/'})
          initPubNub()
        }
      },
      framework7: {
        root: '#app',
        /* Uncomment to enable Material theme: */
        // material: true,
        routes: [
          {
            path: '/chat/',
            component: 'page-chat'
          }
        ],
      }
    });
  }

  // Note: You may want to check out the vue-cordova package on npm for cordova specific handling with vue - https://www.npmjs.com/package/vue-cordova
  document.addEventListener('deviceready', init, false)

})()
