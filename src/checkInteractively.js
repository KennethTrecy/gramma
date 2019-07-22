const kleur = require("kleur")
const checkViaAPI = require("./checkViaAPI")
const Mistake = require("./components/Mistake")
const handleMistake = require("./prompts/handleMistake")
const replaceAll = require("./text-manipulation/replaceAll")
const equal = require("./utils/equal")

const checkInteractively = async (text) => {
  const result = await checkViaAPI(text)

  if (result.matches.length === 0) {
    console.log(kleur.green("No mistakes found!"))
    return { changed: false, text }
  } 
    console.log(`Found ${result.matches.length} potential mistakes`)

    let matches = result.matches
    const total = matches.length
    const transformations = []

    while (matches.length > 0) {
      console.clear()
      console.log(
        `Resolved: ${total - matches.length} | Pending: ${matches.length}`,
      )

      const currentMatch = matches.shift()
      console.log(Mistake(currentMatch))

      const { option, replacement } = await handleMistake(
        currentMatch.replacements,
      )

      if (option === "i") {
        matches = matches.filter((match) => {
          return !equal(
            [
              match.message,
              match.shortMessage,
              match.replacements,
              match.type,
              match.rule,
            ],
            [
              currentMatch.message,
              currentMatch.shortMessage,
              currentMatch.replacements,
              currentMatch.type,
              currentMatch.rule,
            ],
          )
        })
      } else if (option === "n") {
        matches.push(currentMatch)
      } else if (option === "0") {
        transformations.push({
          change: replacement,
          offset: currentMatch.offset,
          length: currentMatch.length,
        })
      } else {
        transformations.push({
          change: currentMatch.replacements[Number(option) - 1].value,
          offset: currentMatch.offset,
          length: currentMatch.length,
        })
      }
    }

    return { changed: true, text: replaceAll(text, transformations) }
  
}

module.exports = checkInteractively
