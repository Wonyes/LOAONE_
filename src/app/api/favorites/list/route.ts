import { createSupabaseServer } from "@/lib/supabase/server/server";
import { NextResponse } from "next/server";

// GET: 즐겨찾기 상태 확인 or 전체 목록

export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ favorites: [] });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    favorites: (data || []).map(f => ({
      name: f.character_name,
      serverName: f.server_name,
      itemLevel: f.item_level,
      className: f.class,
      img: f.img,
    })),
  });
}
