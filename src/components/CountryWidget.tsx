import { useCountry } from "../prefs/CountryProvider";

export function CountryWidget() {
  const { country, open } = useCountry();
  const label = country || "All countries";
  return (
    <button
      onClick={open}
      className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 hover:bg-zinc-800"
      title="Select country"
    >
      <span className="text-sm text-zinc-300">Country:</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}