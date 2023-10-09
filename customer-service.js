let sheetID = ''
const apiKey = ''
const keywords = {}
const choices = []

// 输入框
const msgerInput = document.querySelector('.msger-input')
// 聊天框
const msgerChat = document.querySelector('.msger-chat')


/**
 * @description 获取链接参数的值
 * @param {string} param - 参数
 * @returns 对应参数的值
 */
const getParam = param => {
  let reg = new RegExp(`(^|&)${param}=([^&]*)(&|$)`, 'i')
  let r = window.location.search.substr(1).match(reg)
  return null != r ? decodeURIComponent(r[2]) : null
}

const enterPress = n => 13 === n.keyCode && document.querySelector('.msger-send-btn').click()

/**
 * @description 增加消息
 * @param {string} name 发送消息的用户名
 * @param {string} side 消息显示在左侧或者右侧
 *   例：left 或者 right
 * @param {string} text 发送的内容
 */
function appendMessage (name, side, text) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img ${name.toLowerCase()}"></div>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
        </div>
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `
  msgerChat.insertAdjacentHTML('beforeend', msgHTML)
  msgerChat.scrollTop += 500
}

async function updatelist () {
  if (getParam('sheet')) sheetID = getParam('sheet')
  const values = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/sheet!A:B?key=${apiKey}`).then(response => response.json()).then(json => json.values)
  try {
    values.length
  } catch {
    return appendMessage('BOT', 'left', '配置错误，无法使用')
  }
  for (let i = 0; i < values.length; i++) {
    console.log(values[i])
    const multiChoices = values[i][0].split('\n')
    for (const x of multiChoices) {
      keywords[x] = values[i][1].replace(/\n/g, '<br>')
      choices.push(x)
    }
  }
  appendMessage('BOT', 'left', keywords['初始化'])
  update()
}
updatelist()

document.getElementsByClassName('msger-header-title')[0].addEventListener('click', () => {
  appendMessage('BOT', 'left', keywords['初始化'])
  update()
})


// 初始化搜索内容
new autoComplete({
  selector: '#search',
  minChars: 1,
  source: function (term, suggest) {
    term = term.toLowerCase()
    const suggestions = []
    for (let i = 0; i < choices.length; i++) {
      if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i])
    }
    suggest(suggestions)
  }
})

// 获取最相近的词
const similarWord = str => {
  const calculateSimilarity = (str1, str2) => {
    const maxLength = Math.max(str1.length, str2.length);
    let matchingCharacters = 0
    for (let i = 0; i < maxLength; i++) str1[i] === str2[i] && matchingCharacters++
    return matchingCharacters / maxLength
  }
  let mostSimilarWord, maxSimilarity = 0
  for (let i = 0; i < choices.length; i++) {
    const currentWord = choices[i]
    const similarity = calculateSimilarity(str, currentWord)
    if (similarity > maxSimilarity) {
      mostSimilarWord = currentWord
      maxSimilarity = similarity
    }
  }
  return mostSimilarWord
}

/**
 * @description 发送消息
 * @param {string} e 内容
 */
const submit = async e => {
    const getInput = e || msgerInput.value
    if (!getInput) return
    appendMessage('USER', 'right', getInput);
    const content = keywords[similarWord(getInput)]
    if (content) {
      appendMessage('BOT', 'left', content)
    } else {
      appendMessage('BOT', 'left', '不好意思，我不懂你在说什么 🥺')
    }
    msgerInput.value = '', update();
  };

  
function update () {
  document.querySelectorAll('.k').forEach((item) => {
    item.onclick = (e) => submit(item.outerText)
  })
}

// 显示打字状态
function showTyping (status) {
  const typing = document.getElementsByClassName('loading')[0]
  return status ? typing.style.display = 'block' : typing.style.display = 'none'
}


