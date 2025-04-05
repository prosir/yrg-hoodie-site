import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-xl font-bold">
        YOUNG<span className="text-olive-600">RIDERS</span>OOST
      </span>
    </Link>
  )
}

