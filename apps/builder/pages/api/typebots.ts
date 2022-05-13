import { withSentry } from '@sentry/nextjs'
import { Prisma, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { parseNewTypebot } from 'services/typebots/typebots'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'GET') {
      const workspaceId = req.query.workspaceId as string | undefined
      const folderId = req.query.allFolders
        ? undefined
        : req.query.folderId
        ? req.query.folderId.toString()
        : null
      if (!workspaceId) return badRequest(res)
      const typebotIds = req.query.typebotIds as string[] | undefined
      if (typebotIds) {
        const typebots = await prisma.typebot.findMany({
          where: {
            OR: [
              {
                workspace: { members: { some: { userId: user.id } } },
                id: { in: typebotIds },
              },
              {
                id: { in: typebotIds },
                collaborators: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { name: true, id: true, blocks: true },
        })
        return res.send({ typebots })
      }
      const typebots = await prisma.typebot.findMany({
        where: {
          OR: [
            {
              folderId,
              workspace: {
                id: workspaceId,
                members: {
                  some: {
                    userId: user.id,
                    role: { not: WorkspaceRole.GUEST },
                  },
                },
              },
            },
            {
              workspace: {
                id: workspaceId,
                members: {
                  some: { userId: user.id, role: WorkspaceRole.GUEST },
                },
              },
              collaborators: { some: { userId: user.id } },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: { name: true, publishedTypebotId: true, id: true, icon: true },
      })
      return res.send({ typebots })
    }
    if (req.method === 'POST') {
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const typebot = await prisma.typebot.create({
        data:
          'blocks' in data
            ? data
            : (parseNewTypebot({
                ownerId: user.id,
                ownerAvatarUrl: user.image,
                ...data,
              }) as Prisma.TypebotUncheckedCreateInput),
      })
      return res.send(typebot)
    }
    return methodNotAllowed(res)
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      return res.status(500).send({ title: err.name, message: err.message })
    }
    return res.status(500).send({ message: 'An error occured', error: err })
  }
}

export default withSentry(handler)
