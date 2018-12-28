//获取数据库
const DB = require('../utils/db.js')

//执行数据库操作，并返回数据
module.exports = {
  list: async ctx => {
    //返回数据
    
    const movie_id = ctx.request.query['movie_id']
    if (!movie_id) {
      ctx.state.data = {error: '请提供参数 movie_id'}
      return 
    }
    ctx.state.data = await DB.query(`SELECT * FROM reviews WHERE movieId = ${movie_id};`)
  },

  all: async ctx => {
    ctx.state.data = await DB.query(`SELECT * FROM reviews;`)
  },

  add: async ctx => {
    const body = ctx.request.body
    let image_url = body.imageUrl
    let name = body.name
    let data_type = body.dataType
    let text = body.text
    let voice_url = body.voiceUrl
    let movie_id = body.movieId
    let duration = body.duration
    // let user_id = body.userId
    let user_id = ctx.state.$wxInfo.userinfo.openId

    ctx.state.data = await DB.query(`INSERT INTO reviews(imageUrl, name, dataType, text, voiceUrl, movieId, user_id, duration) VALUES (?,?,?,?,?,?,?,?)`,
                        [image_url, name, data_type, text, voice_url, movie_id, user_id, duration])
  },

  favour: async ctx => {
    const body = ctx.request.query
    const review_id = body.review_id
    let user_id = ctx.state.$wxInfo.userinfo.openId

    ctx.state.data = await DB.query(`INSERT INTO collected_reviews(review_id, user_id) VALUES (?, ?)`, [review_id, user_id] )
  },

  mine: async ctx => {
    let user_id = ctx.state.$wxInfo.userinfo.openId
    const reviews = await DB.query(`SELECT * FROM reviews WHERE user_id = '${user_id}'`)

    const result = []
    for (const review of reviews) {
      const movies = await DB.query(`SELECT * FROM movies WHERE id = ${review.movieId};`)
      const movie = movies[0]
      result.push({
        review,
        movie
      })
    }

    ctx.state.data = result

  },

  allFavour: async ctx => {
    let user_id = ctx.state.$wxInfo.userinfo.openId
    const collectedReviews = await DB.query(`SELECT * FROM collected_reviews WHERE user_id = '${user_id}'`)

    let reviews = []
    for (const item of collectedReviews) {
      const review = await DB.query(`SELECT * FROM reviews WHERE review_id = ${item.review_id};`)
      reviews.push(review[0])
    }

    const result = []
    for (const review of reviews) {
      const movies = await DB.query(`SELECT * FROM movies WHERE id = ${review.movieId};`)
      const movie = movies[0]
      result.push({
        review,
        movie
      })
    }

    ctx.state.data = result

  }
}