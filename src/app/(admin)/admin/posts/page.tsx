import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostsTable } from "@/features/blog/PostsTable";
import { deletePost } from "@/features/blog/actions";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Posts</h1>
        <Link href="/admin/posts/new">+ Nuevo post</Link>
      </header>
      <PostsTable rows={posts} onDelete={deletePost} />
    </section>
  );
}
