const querystring = require("querystring")
const Trello = require("trello")

const unquote = (text) => {
  return text.replace(/“/g, "").replace(/”/g, "")
}

const bold = (text) => `*${text}*`

const code = (text) => `\`${text}\``

const BROKEN_HEART = ":broken_heart:"

const DART = ":dart:"

module.exports.handler = async (event) => {
  const { token, text } = querystring.parse(event.body)

  const term = unquote(text)

  if (process.env.SLACK_VERIFICATION_TOKEN !== token) {
    return {
      statusCode: 401,
      body: "Unauthorized"
    }
  }

  const {
    TRELLO_API_KEY: apiKey,
    TRELLO_SERVER_TOKEN: serverToken,
    TRELLO_BOARD_ID: boardId
  } = process.env

  const trello = new Trello(apiKey, serverToken)

  const cards = await trello.getCardsOnBoard(boardId)

  const card = cards.find(
    ({ name }) => name.toLowerCase() === term.toLowerCase()
  )

  if (!card) {
    return {
      statusCode: 200,
      body: `${BROKEN_HEART} ${bold(
        "Huh-bot couldn't find definition for term"
      )} ${code(
        term
      )}. Checking your spelling (and maybe try a singular or plural form).`
    }
  }

  return {
    statusCode: 200,
    body: `${DART} ${card.desc}`
  }
}
