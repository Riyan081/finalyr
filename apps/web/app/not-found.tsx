import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 font-heading font-black text-6xl">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <Link
          href="/"
          className="brutal-btn bg-primary text-primary-foreground font-bold inline-flex items-center gap-2"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
