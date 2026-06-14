import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/features/blog/PostForm";
import { toFormValues, toAttachmentItems } from "@/features/blog/schema";
import { updatePost } from "@/features/blog/actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { attachments: { orderBy: { order: "asc" } } },
  });
  if (!post) notFound();

  return (
    <section>
      <h1>Editar post</h1>
      <PostForm
        defaultValues={toFormValues(post)}
        initialFiles={toAttachmentItems(post.attachments)}
        action={updatePost.bind(null, post.id)}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
