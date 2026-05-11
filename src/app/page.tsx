import Feed from "@/components/Feed";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              ⋆⁺₊⋆ ⋆⁺₊⋆ ❤ ⋆⁺₊⋆ ⋆⁺₊⋆
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            하루의 이야기를 공유하고 공감해보세요
          </p>
        </header>
        <Feed />
      </div>
    </main>
  );
}
