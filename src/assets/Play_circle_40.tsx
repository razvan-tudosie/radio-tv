function Play_circle_40(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg" 
         {...props} // allows className, onClick, etc.
        >
            <path d="M5 20C5 11.7157 11.7157 5 20 5C28.2843 5 35 11.7157 35 20C35 28.2843 28.2843 35 20 35C11.7157 35 5 28.2843 5 20Z" stroke = "currentColor" stroke-width="2" />
            <path d="M24.1667 18.5569C25.2779 19.1984 25.2779 20.8021 24.1667 21.4436L19.1667 24.3304C18.0556 24.9719 16.6667 24.17 16.6667 22.887L16.6667 17.1135C16.6667 15.8305 18.0556 15.0286 19.1667 15.6701L24.1667 18.5569Z" stroke="currentColor" stroke-width="2" />
        </svg>
    );
}

export default Play_circle_40

