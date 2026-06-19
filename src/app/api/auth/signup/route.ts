// 用户注册 API
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// 注册输入校验
const signupSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  name: z.string().min(1, '请输入姓名').max(50, '姓名最多50个字符'),
  password: z.string().min(6, '密码至少6位'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { email, name, password } = result.data

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 409 }
      )
    }

    // 加密密码
    const passwordHash = await hash(password, 12)

    // 创建用户
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER',
      },
    })

    return NextResponse.json(
      { message: '注册成功' },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
