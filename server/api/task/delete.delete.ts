export default defineEventHandler(async (e) => {
  const body = await readBody(e)
  const db = useDB()

  const id = body.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request format"
    })
  }

  try {
    await db.deleteTask(id)
    return {}
  } catch (err) {
    dbErrorHandler(err)
  }
})