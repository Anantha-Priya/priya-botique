import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin/get-admin-context";
import { isSameSiteRequest } from "@/lib/admin/is-same-site-request";

const idSchema = z.string().uuid();
const pinBodySchema = z.object({
  isPinned: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  const admin = await getAdminContext();
  if (!admin.user) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }
  if (!admin.isAdmin) {
    return NextResponse.json(
      { error: "Administrator access is required." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pinBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pin status payload." },
      { status: 400 },
    );
  }

  const { data: updatedProduct, error } = await admin.supabase
    .from("products")
    .update({ is_pinned: parsed.data.isPinned })
    .eq("id", id)
    .select("id,name,is_pinned")
    .maybeSingle();

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      return NextResponse.json(
        {
          error:
            "Pinning is not enabled yet in the database. Please apply the products is_pinned migration first.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updatedProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/new-arrivals");
  revalidatePath("/admin/products");

  return NextResponse.json({ product: updatedProduct });
}
