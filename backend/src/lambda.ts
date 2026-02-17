
import awsLambdaFastify from '@fastify/aws-lambda'
import Fastify from 'fastify'
import app from './app'

const fastify = Fastify({
    logger: true
})

fastify.register(app)

export const handler = awsLambdaFastify(fastify)

export const authTriggerHandler = async (event: any) => {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    return event;
};
