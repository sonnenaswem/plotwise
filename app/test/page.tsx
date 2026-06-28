export default function TestPage() {
  return (
    <div className="p-10">
      <h1>{process.env.NEXT_PUBLIC_SUPABASE_URL}</h1>
    </div>
  );
}