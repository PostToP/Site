"use client";
import {notFound, useParams} from "next/navigation";
import {useEffect, useState} from "react";
import Card from "@/components/Card/Card";
import CurrentlyListeningCard from "@/components/Card/CurrentlyListeningCard";
import ListenedGraph from "@/components/Graph/ListenedGraph";
import TopGenreRadarChart from "@/components/Graph/TopGenreRadarChart";
import ListenHistory from "@/components/List/ListenHistory";
import DateSelector, {DateRange} from "@/components/Misc/DateSelector";
import ProfileUser from "@/components/Misc/ProfileUser";
import TopArtistShowcase from "@/components/Showcase/TopArtistShowcase";
import TopMusicShowcase from "@/components/Showcase/TopMusicShowcase";
import UserBackend from "@/utils/Backend/UserBackend";

export default function UserPage() {
    const params = useParams<{id: string}>();
    const {id} = params;
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [loading, setLoading] = useState(true);
    const [userNotFound, setUserNotFound] = useState(false);

    useEffect(() => {
        async function checkUserExists() {
            const res = await UserBackend.getUserInfo(params.id);
            if (!res.ok) {
                console.error("Error fetching user info:", res.error);
                setUserNotFound(true);
            }
            setLoading(false);
        }
        setLoading(true);
        checkUserExists();
    }, [params.id]);

    if (userNotFound) {
        notFound();
    }

    return loading ? (
        <div>Loading...</div>
    ) : (
        <main className="grid-rows-[auto_1fr]">
            <DateSelector
                onDateChange={dateRange => {
                    setDateRange(dateRange);
                }}
            />
            <main className="grid grid-cols-12 gap-4 md:gap-6 px-4 md:px-0">
                <div className="col-span-12">
                    <ProfileUser user_handle={id} />
                </div>
                <div className="col-span-12 md:col-span-8 md:max-h-72">
                    <CurrentlyListeningCard user_handle={id} />
                </div>
                <div className="col-span-12 md:col-span-4 md:row-span-2">
                    <TopMusicShowcase user_handle={id} dateRange={dateRange} />
                </div>
                <div className="col-span-12 md:col-span-4 md:row-span-3 gap-6 flex flex-col">
                    <TopArtistShowcase user_handle={id} dateRange={dateRange} />
                    <Card>
                        <h2 className="text-xl font-medium">Top Genres</h2>
                        <div>
                            <TopGenreRadarChart user_handle={id} dateRange={dateRange} />
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-4">
                    <Card>
                        <h2 className="text-xl font-medium">Listening Activity</h2>
                        <div>
                            <ListenedGraph user_handle={id} dateRange={dateRange} />
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-8">
                    <ListenHistory userId={id} />
                </div>
                <div className="col-span-12 md:col-span-4"></div>
            </main>
        </main>
    );
}
