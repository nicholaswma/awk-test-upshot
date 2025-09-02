import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { createMessage, tag } from '../utils/arweaveUtils';
import { Button } from './Button';
import { Input } from './Input';
import { createDataItemSigner } from '@permaweb/aoconnect';

interface LeaderboardStat {
    player_address: string;
    total_rank_points: number;
    winning_card_points: number;
    set_completion_points: number;
    other_rank_points: number;
    rank_level_number: number;
    rank_title: string;
    percentile?: number;
    last_updated: number;
    created_at: number;
}

interface LeaderboardResponse {
    leaderboard_stats: LeaderboardStat[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

export function LeaderboardStats() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [leaderboardData, setLeaderboardData] =
        useState<LeaderboardResponse | null>(null);
    const [playerRank, setPlayerRank] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [minRankPoints, setMinRankPoints] = useState<string>('');
    const [filterPlayerAddress, setFilterPlayerAddress] = useState<string>('');
    const [rankPlayerAddress, setRankPlayerAddress] = useState<string>('');

    const fetchLeaderboardStats = async () => {
        if (!ao) return;
        setLoading(true);
        setError(null);
        try {
            console.log(' | Fetching Leaderboard Stats');

            const filters: any = {};
            if (minRankPoints.trim()) {
                filters['total_rank_points[gte]'] = parseInt(minRankPoints);
            }
            if (filterPlayerAddress.trim()) {
                filters['player_address'] = filterPlayerAddress.trim();
            }

            const data = {
                filters,
                page,
                pageSize,
                // sortBy: '-total_rank_points',
            };

            const result = await ao.message({
                ...createMessage(
                    'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung',
                    [
                        tag('Action', 'ListLeaderboardStats'),
                        tag('Data', JSON.stringify(data)),
                    ]
                ),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log(' | Full LeaderboardStats Result: ');
            console.log(result);

            if (result.Messages && result.Messages[0]?.Data) {
                try {
                    const parsedData = JSON.parse(result.Messages[0].Data);
                    setLeaderboardData(parsedData);
                } catch (e) {
                    setLeaderboardData(result.Messages[0].Data);
                }
            } else if (result.Output) {
                setLeaderboardData(result.Output);
            } else {
                setLeaderboardData(result);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlayerRank = async () => {
        if (!ao) return;
        setLoading(true);
        setError(null);
        try {
            console.log(' | Fetching Player Rank');

            const data = rankPlayerAddress.trim()
                ? { player_address: rankPlayerAddress.trim() }
                : {};

            const result = await ao.message({
                ...createMessage(
                    'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung',
                    [
                        tag('Action', 'GetPlayerRank'),
                        ...(Object.keys(data).length > 0
                            ? [tag('Data', JSON.stringify(data))]
                            : []),
                    ]
                ),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log(' | Full PlayerRank Result: ');
            console.log(result);

            if (result.Messages && result.Messages[0]?.Data) {
                try {
                    const parsedData = JSON.parse(result.Messages[0].Data);
                    setPlayerRank(parsedData);
                } catch (e) {
                    setPlayerRank(result.Messages[0].Data);
                }
            } else if (result.Output) {
                setPlayerRank(result.Output);
            } else {
                setPlayerRank(result);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setLeaderboardData(null);
        setPlayerRank(null);
        setError(null);
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            {/* Leaderboard Stats Section */}
            <div className="w-full rounded border border-gray-300 p-4">
                <h3 className="mb-4 text-lg font-semibold text-white">
                    Leaderboard Stats
                </h3>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Page:
                        </label>
                        <Input
                            type="number"
                            value={page.toString()}
                            onChange={(e) =>
                                setPage(parseInt(e.target.value) || 1)
                            }
                            placeholder="1"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Page Size:
                        </label>
                        <Input
                            type="number"
                            value={pageSize.toString()}
                            onChange={(e) =>
                                setPageSize(parseInt(e.target.value) || 10)
                            }
                            placeholder="10"
                            min="1"
                            max="100"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Min Rank Points:
                        </label>
                        <Input
                            type="number"
                            value={minRankPoints}
                            onChange={(e) => setMinRankPoints(e.target.value)}
                            placeholder="e.g. 100"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Filter by Player Address:
                        </label>
                        <Input
                            type="text"
                            value={filterPlayerAddress}
                            onChange={(e) =>
                                setFilterPlayerAddress(e.target.value)
                            }
                            placeholder="Player address"
                        />
                    </div>
                </div>

                <Button
                    onClick={fetchLeaderboardStats}
                    disabled={loading}
                    className="mb-2"
                >
                    {loading ? 'Loading...' : 'Fetch Leaderboard Stats'}
                </Button>
            </div>

            {/* Player Rank Section */}
            <div className="w-full rounded border border-gray-300 p-4">
                <h3 className="mb-4 text-lg font-semibold text-white">
                    Get Player Rank
                </h3>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-white">
                        Player Address (leave empty to use msg.From):
                    </label>
                    <Input
                        type="text"
                        value={rankPlayerAddress}
                        onChange={(e) => setRankPlayerAddress(e.target.value)}
                        placeholder="Optional: player address"
                    />
                </div>

                <Button
                    onClick={fetchPlayerRank}
                    disabled={loading}
                    className="mb-2"
                >
                    {loading ? 'Loading...' : 'Get Player Rank'}
                </Button>
            </div>

            {/* Clear Results */}
            {(leaderboardData || playerRank || error) && (
                <Button
                    onClick={clearResults}
                    className="bg-gray-600 hover:bg-gray-700"
                >
                    Clear Results
                </Button>
            )}

            {/* Error Display */}
            {error && (
                <div className="w-full rounded bg-red-100 p-4 text-red-700">
                    <h4 className="font-semibold">Error:</h4>
                    <p>{error}</p>
                </div>
            )}

            {/* Leaderboard Results */}
            {leaderboardData && (
                <div className="w-full">
                    <h4 className="mb-4 text-lg font-semibold text-white">
                        Leaderboard Results:
                    </h4>

                    {leaderboardData.pagination && (
                        <div className="mb-4 rounded bg-gray-100 p-3 text-black">
                            <h5 className="font-semibold">Pagination Info:</h5>
                            <p>
                                Page {leaderboardData.pagination.page} of{' '}
                                {leaderboardData.pagination.totalPages}
                            </p>
                            <p>
                                Showing{' '}
                                {leaderboardData.leaderboard_stats?.length || 0}{' '}
                                of {leaderboardData.pagination.totalItems} total
                                items
                            </p>
                        </div>
                    )}

                    {leaderboardData.leaderboard_stats &&
                    leaderboardData.leaderboard_stats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full rounded bg-gray-100 text-black">
                                <thead>
                                    <tr className="border-b bg-gray-200">
                                        <th className="p-2 text-left">Rank</th>
                                        <th className="p-2 text-left">
                                            Player Address
                                        </th>
                                        <th className="p-2 text-left">
                                            Total Points
                                        </th>
                                        <th className="p-2 text-left">
                                            Winning Card
                                        </th>
                                        <th className="p-2 text-left">
                                            Set Completion
                                        </th>
                                        <th className="p-2 text-left">Other</th>
                                        <th className="p-2 text-left">
                                            Rank Title
                                        </th>
                                        <th className="p-2 text-left">
                                            Percentile
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.leaderboard_stats.map(
                                        (stat, index) => (
                                            <tr
                                                key={stat.player_address}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-2">
                                                    {(page - 1) * pageSize +
                                                        index +
                                                        1}
                                                </td>
                                                <td className="p-2 font-mono text-xs">
                                                    {stat.player_address}
                                                </td>
                                                <td className="p-2 font-semibold">
                                                    {stat.total_rank_points}
                                                </td>
                                                <td className="p-2">
                                                    {stat.winning_card_points}
                                                </td>
                                                <td className="p-2">
                                                    {stat.set_completion_points}
                                                </td>
                                                <td className="p-2">
                                                    {stat.other_rank_points}
                                                </td>
                                                <td className="p-2">
                                                    {stat.rank_title}
                                                </td>
                                                <td className="p-2">
                                                    {stat.percentile
                                                        ? `${stat.percentile}%`
                                                        : '-'}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded bg-gray-100 p-4 text-black">
                            No leaderboard stats found.
                        </div>
                    )}

                    <div className="mt-4">
                        <h5 className="mb-2 font-semibold text-white">
                            Raw Response:
                        </h5>
                        <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs text-black">
                            {JSON.stringify(leaderboardData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Player Rank Results */}
            {playerRank && (
                <div className="w-full">
                    <h4 className="mb-4 text-lg font-semibold text-white">
                        Player Rank Results:
                    </h4>

                    {playerRank.player_address && (
                        <div className="mb-4 rounded bg-gray-100 p-4 text-black">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold">
                                        Player Address:
                                    </h5>
                                    <p className="font-mono text-xs">
                                        {playerRank.player_address}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="font-semibold">
                                        Total Rank Points:
                                    </h5>
                                    <p className="text-xl font-bold">
                                        {playerRank.total_rank_points}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="font-semibold">
                                        Winning Card Points:
                                    </h5>
                                    <p>{playerRank.winning_card_points}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold">
                                        Set Completion Points:
                                    </h5>
                                    <p>{playerRank.set_completion_points}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold">
                                        Other Rank Points:
                                    </h5>
                                    <p>{playerRank.other_rank_points}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold">
                                        Rank Level:
                                    </h5>
                                    <p>{playerRank.rank_level_number}</p>
                                </div>
                                <div className="col-span-2">
                                    <h5 className="font-semibold">
                                        Rank Title:
                                    </h5>
                                    <p className="text-lg">
                                        {playerRank.rank_title}
                                    </p>
                                </div>
                                {playerRank.percentile && (
                                    <div>
                                        <h5 className="font-semibold">
                                            Percentile:
                                        </h5>
                                        <p>{playerRank.percentile}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <h5 className="mb-2 font-semibold text-white">
                            Raw Response:
                        </h5>
                        <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs text-black">
                            {JSON.stringify(playerRank, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
