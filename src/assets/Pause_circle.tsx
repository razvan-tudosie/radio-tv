function Pause_circle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // allows className, onClick, etc.
    >
        <path d="M5 20C5 11.7157 11.7157 5 20 5C28.2843 5 35 11.7157 35 20C35 28.2843 28.2843 35 20 35C11.7157 35 5 28.2843 5 20Z" stroke="currentColor" stroke-width="2"/>
        <path d="M16.6666 16.6665L16.6666 23.3332M23.3333 16.6665V23.3332" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  );
}

export default Pause_circle