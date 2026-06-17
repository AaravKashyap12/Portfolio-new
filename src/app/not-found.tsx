import Link from "next/link";
import Pixel404Game from "../components/Pixel404Game";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <p className="not-found-brand">@byaarav / 404</p>
          <h1 id="not-found-title">404</h1>
          <p>
            This route slipped out of the final build.
            <br />
            Keep the pixel cat alive, or head back.
          </p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-home">
              Go home -&gt;
            </Link>
            <span>aaravkashyap.live</span>
          </div>
        </div>
        <Pixel404Game />
      </section>
    </main>
  );
}
