import { PostForm } from "@/features/blog/PostForm";
import { createPost } from "@/features/blog/actions";

export default function NewPostPage() {
  return (
    <section>
      <h1>Nuevo post</h1>
      <PostForm action={createPost} submitLabel="Crear post" />
    </section>
  );
}
