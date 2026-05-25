import { Outlet } from "react-router-dom"
import { Navbar } from "../components/websiteComponents/Navbar"

export const WebsiteLayout = () => {

    return (
        <div className="website-layout min-h-screen bg-white">
            <div className="navbar-bar">
                <Navbar />
            </div>
            <main className="pt-19">
                <div className="main-content">
                    <Outlet />
                </div>
            </main>

        </div>
    )
}