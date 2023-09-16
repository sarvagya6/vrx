import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { env } from "@/env.mjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
      },
      pages: {
        signIn: "/login",
      },
      providers: [
        GoogleProvider(
            {
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
            }
        ),
        ],
        callbacks: {
            async session({ token, session }) {
                if (token) {
                  session.user.id = token.id
                  session.user.name = token.name
                  session.user.email = token.email
                  session.user.image = token.picture
                }
          
                return session
            },
            async jwt({ token, user }) {
              const dbUser = await db.user.findFirst({
                where: {
                  email: token.email,
                },
              })
        
              if (!dbUser) {
                if (user) {
                  token.isHealthcareProfessional = localStorage.getItem('isHealthcareProfessional')
                  token.id = user?.id
                }
                return token
              }
        
              return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
              }
            },

            //TODO: Update for production use
            redirect() {
              return '/'
            }
          },
        }

export const getAuthSession = () => getServerSession(authOptions)