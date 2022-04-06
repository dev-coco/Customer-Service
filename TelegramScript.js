const TelegramBotToken = ''
const myID = ''
const TelegramBotAPI = 'https://api.telegram.org/bot' + TelegramBotToken + '/'

function getFormData (e) {
  const form = FormApp.getActiveForm()
  const formTitle = form.getTitle()
  const currentItemResponses = e.response.getItemResponses()
  let message = '\n\n' + formTitle
  for (let i = 0; i < currentItemResponses.length; i++) {
    if (currentItemResponses[i].getResponse() !== '') {
      message += '\n\n' + currentItemResponses[i].getItem().getTitle() + '：' + currentItemResponses[i].getResponse()
    }
  }
  pushTelegramBotMessage(message, myID)
}

function pushTelegramBotMessage (message, myID) {
  const payload = {
    method: 'sendMessage',
    chat_id: myID,
    text: message
  }
  const options = {
    method: 'post',
    payload: payload
  }
  UrlFetchApp.fetch(TelegramBotAPI, options)
}
