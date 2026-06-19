// 分类标签列表 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaxonomyType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const typeParam = searchParams.get('type')

  const taxonomies = await prisma.taxonomy.findMany({
    where: typeParam ? { type: typeParam as TaxonomyType } : undefined,
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(taxonomies)
}
