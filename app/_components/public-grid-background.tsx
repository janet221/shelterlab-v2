export function PublicGridBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/b.jpg')", backgroundColor: "#f7f4f0" }}
    />
  );
}

export const publicGridOverlay =
  "bg-[linear-gradient(180deg,rgba(255,250,240,0.82),rgba(247,239,223,0.94))]";
