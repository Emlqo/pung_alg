import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-emerald-50 text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/summer-school-hero.png')",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/78 to-white/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-100/95 to-transparent"
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8">
        <div className="max-w-3xl py-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-black text-emerald-800 shadow-sm backdrop-blur">
            <SchoolIcon />
            풍양중학교 알고리즘 학습실
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
            <span className="block">풍양중학교</span>
            <span className="block">알고리즘 공부하기</span>
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-bold leading-9 text-slate-700">
            푸른 여름 교실에서 순서도를 읽고, 빈칸을 채우며, 알고리즘의
            흐름을 차근차근 익혀 봅니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-sky-100 px-4 py-2 text-base font-black text-sky-800 shadow-sm">
              순서도
            </span>
            <span className="rounded-full bg-amber-100 px-4 py-2 text-base font-black text-amber-800 shadow-sm">
              빈칸 채우기
            </span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-base font-black text-emerald-800 shadow-sm">
              단계별 문제
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-16 items-center justify-center rounded-[8px] bg-emerald-600 px-8 text-xl font-black text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              href="/student"
            >
              공부하러가기
            </Link>
            <Link
              className="inline-flex min-h-16 items-center justify-center rounded-[8px] border-2 border-emerald-200 bg-white/92 px-8 text-lg font-black text-slate-800 shadow-sm backdrop-blur transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              href="/teacher"
            >
              교사용
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-8 right-5 hidden rounded-[8px] border border-white/80 bg-white/86 p-4 shadow-soft backdrop-blur md:block lg:right-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-800">
              6
            </div>
            <div>
              <p className="text-sm font-black text-emerald-700">
                여름 알고리즘
              </p>
              <p className="text-lg font-black text-slate-950">
                오늘도 한 단계씩
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SchoolIcon() {
  return (
    <span className="relative inline-flex h-7 w-8 items-end justify-center">
      <span className="absolute bottom-0 h-5 w-7 rounded-[4px] border-2 border-emerald-600 bg-emerald-100" />
      <span className="absolute bottom-5 h-0 w-0 border-x-[14px] border-b-[10px] border-x-transparent border-b-emerald-600" />
      <span className="absolute bottom-[3px] h-2 w-2 rounded-sm bg-sky-200" />
    </span>
  );
}
