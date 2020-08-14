Brandon Sanderson is a prolific author who publishes regularly-updated progress bars on [his website](https://brandonsanderson.com)

This repo contains a bot which monitors those progress bars and tweets out changes.
You can see it in action at https://twitter.com/SandersonWrote

![test status](https://github.com/jffry/SandersonWrote-bot/workflows/Run%20Tests/badge.svg)
![bot status](https://healthchecks.io/badge/f5327466-9064-47fd-a1ad-cc6203692963/dc3XvLhQ/%2540SandersonWrote.svg)


## Setup Steps

- `npm install`
- Copy `data/auth.sample.json` to `data/auth.json`
- Make a `healthchecks.io` ping and put the URLs in `data/auth.json`
- Create a Twitter account from which the bot will Tweet
- Signed in as that account, follow [twitter-lite's readme](https://github.com/draftbit/twitter-lite#usage) to create a new Twitter app with the bare minimum permission (read/write tweets) and everything else turned off
  - My developer application was approved quickly but you may have to wait.
- Paste all the relevant values from your Twitter app in the right places in `data/auth.json`
- Run `npm start`

## Operation

I run this bot in a `node:14-slim` Docker image.  If the process dies, the container just gets restarted.

If I wanted to spend more than a few evenings on it, I might go back and make error handling more robust and provide a better way to run locally without Twitter / Healthchecks set up.

## Tests

Run the tests with `npm test`

## License

Released under the MIT license. See [LICENSE.md](LICENSE.md) for full license text
