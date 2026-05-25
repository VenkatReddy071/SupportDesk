import { useEffect, useState } from "react"

interface NavbarItem {
    item: number
    title: string
    isActive: boolean
}

export const Navbar = () => {
    const [navbar, setNavbar] = useState<NavbarItem[]>([])

    const data: NavbarItem[] = [
        { item: 0, title: 'Home', isActive: true },
        { item: 1, title: 'Features', isActive: false },
        { item: 2, title: 'Pricing', isActive: false },
        { item: 3, title: 'Integrations', isActive: false },
        { item: 4, title: 'Docs', isActive: false },
        { item: 5, title: 'Blog', isActive: false },
    ]

    useEffect(() => {
        setNavbar(data)
    }, [])

    return (
        <header className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <i className="fa-solid fa-headset text-lg"></i>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            SupportDesk
                        </h2>

                        <p className="text-xs text-gray-500">
                            Customer Support Platform
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    {/* Navigation */}
                    <nav>
                        <ul className="flex items-center gap-2">

                            {navbar.map((item) => (
                                <li
                                    key={item.item}
                                    className={`
                                        px-5 py-2.5
                                        rounded-lg
                                        text-sm
                                        font-medium
                                        cursor-pointer
                                        transition-all
                                        duration-200
                                        ${item.isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    {item.title}
                                </li>
                            ))}

                        </ul>
                    </nav>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">

                        <button className="px-5 py-2 rounded-xl text-sm border-2 font-medium text-gray-700 hover:bg-gray-100 transition-all">
                            Log in
                        </button>

                        <button className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                            Start free trial
                        </button>

                    </div>

                </div>
            </div>
        </header>
    )
}