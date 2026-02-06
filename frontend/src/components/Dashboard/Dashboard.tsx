import type { JSX } from "react"
import { Navbar } from "../Layout/Navbar"
import { BalanceData } from "./BalanceData"
import { QuickActions } from "./QuickActions"

export const Dashboard = (): JSX.Element => {
    return (
       <div>

                <Navbar />
                {/* THIS GRID CONTROLS THE LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-9">
                    {/* Wallet card (2/3 width) */}
                    <div className="md:col-span-2">
                        <BalanceData />
                    </div>

                    {/* Quick actions (1/3 width) */}
                    <div className="md:col-span-1">
                        <QuickActions />
                    </div>
                </div>

            </div>

        
    )
}