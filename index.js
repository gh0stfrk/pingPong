const { writeDataToMongo } = require('./utils.js')

exports.handler = async (event, context) => {
    console.log(`Event Received : ${JSON.stringify(event)}`)
    const coorelationId = context.awsRequestId;
    console.log(`Context : ${JSON.stringify(context)}`)
    await writeDataToMongo({
        event: event,
        id: coorelationId
    })
    return {
        statusCode: 200,
        body: JSON.stringify({
            "msg": "Event logged."
        })
    }
}