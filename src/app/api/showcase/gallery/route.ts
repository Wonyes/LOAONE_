import { createSupabaseServer } from "@/lib/supabase/server/server";
import { NextRequest, NextResponse } from "next/server";
import { ShowcaseSortOption } from "@/types/showcase";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sort: ShowcaseSortOption =
    (searchParams.get("sort") as ShowcaseSortOption) || "latest";

  const supabase = await createSupabaseServer();

  // 1. 현재 유저 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const offset = (page - 1) * PAGE_SIZE;

  // 2. 기본 쿼리 구성 (like_count는 테이블에 컬럼으로 존재해야 함)
  let query = supabase.from("avatar_showcase").select("*", { count: "exact" });

  // 3. 정렬 로직 (DB 서버에서 처리)
  if (sort === "popular") {
    query = query
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // 4. 페이지네이션 범위 지정
  const {
    data: showcases,
    error,
    count,
  } = await query.range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }

  // 5. 좋아요 상태 최적화 (N+1 문제 해결)
  let likedShowcaseIds: Set<string> = new Set();

  if (user && showcases && showcases.length > 0) {
    const showcaseIds = showcases.map(s => s.id);
    const { data: myLikes } = await supabase
      .from("avatar_likes")
      .select("showcase_id")
      .eq("user_id", user.id)
      .in("showcase_id", showcaseIds);

    if (myLikes) {
      likedShowcaseIds = new Set(myLikes.map(like => like.showcase_id));
    }
  }

  // 6. 결과 가공
  const showcasesWithStats = showcases?.map(showcase => ({
    ...showcase,
    like_count: showcase.like_count || 0,
    is_liked: likedShowcaseIds.has(showcase.id),
  }));

  const total = count || 0;
  const hasMore = offset + PAGE_SIZE < total;

  return NextResponse.json({
    showcases: showcasesWithStats,
    total,
    page,
    hasMore,
  });
}
