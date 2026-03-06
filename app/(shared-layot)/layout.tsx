import { Navbar } from "@/components/web/navbar";


export default function Sharelayout({children}:{children: React.ReactNode}){
    return (
        <><Navbar />{children}</>
    )
}