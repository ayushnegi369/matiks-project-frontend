import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, TextInput, FlatList, ActivityIndicator,
    Platform, TouchableOpacity, Dimensions, useColorScheme
} from 'react-native';
import { fetchLeaderboard, searchUsers, simulateTraffic, User } from './services/api';

const { width } = Dimensions.get('window');

// Theme Configuration
const THEME = {
    light: {
        bg: '#F3F4F6',
        card: '#FFFFFF',
        text: '#111827',
        subtext: '#6B7280',
        headerBg: '#4338CA',
        headerText: '#FFFFFF',
        rankBadge: '#F3F4F6',
        rankText: '#6B7280',
        inputBg: 'rgba(255,255,255,0.15)',
        inputText: '#FFFFFF',
        borderColor: '#E5E7EB',
        shadow: '#000',
    },
    dark: {
        bg: '#111827', // Gray 900
        card: '#1F2937', // Gray 800
        text: '#F9FAFB', // Gray 50
        subtext: '#9CA3AF', // Gray 400
        headerBg: '#312E81', // Indigo 900
        headerText: '#FFFFFF',
        rankBadge: '#374151', // Gray 700
        rankText: '#D1D5DB', // Gray 300
        inputBg: 'rgba(0,0,0,0.3)',
        inputText: '#FFFFFF',
        borderColor: '#374151',
        shadow: '#000',
    }
};

export default function App() {
    const systemScheme = useColorScheme();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [mode, setMode] = useState<'leaderboard' | 'search'>('leaderboard');
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

    const theme = isDarkMode ? THEME.dark : THEME.light;

    const loadLeaderboard = useCallback(async () => {
        setLoading(true);
        const data = await fetchLeaderboard(50);
        setUsers(data);
        setLoading(false);
    }, []);

    // Initial Load
    useEffect(() => {
        loadLeaderboard();
    }, []);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 0) {
            setMode('search');
            if (text.length > 2) {
                setLoading(true);
                const data = await searchUsers(text);
                setUsers(data);
                setLoading(false);
            }
        } else {
            setMode('leaderboard');
            loadLeaderboard();
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        await simulateTraffic();
        // Reload leaderboard to show changes from top
        if (mode === 'leaderboard') {
            await loadLeaderboard();
        }
        setSimulating(false);
    };

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const renderItem = ({ item }: { item: User }) => {
        let borderColor = 'transparent';
        let rankBg = theme.rankBadge;
        let rankColor = theme.rankText;

        // Premium styling for top ranks
        if (item.rank === 1) {
            rankBg = isDarkMode ? '#451a03' : '#FEF3C7'; rankColor = '#D97706'; borderColor = '#F59E0B';
        } else if (item.rank === 2) {
            rankBg = isDarkMode ? '#1f2937' : '#F3F4F6'; rankColor = isDarkMode ? '#9CA3AF' : '#4B5563'; borderColor = '#9CA3AF';
        } else if (item.rank === 3) {
            rankBg = isDarkMode ? '#431407' : '#FFEDD5'; rankColor = '#EA580C'; borderColor = '#B45309';
        }

        const isTop3 = item.rank <= 3 && mode === 'leaderboard';

        return (
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }, isTop3 && { borderColor, borderWidth: 1, backgroundColor: isDarkMode ? '#171717' : '#FAFAFA' }]}>
                <View style={styles.leftSection}>
                    <View style={[styles.rankBadge, { backgroundColor: rankBg }]}>
                        <Text style={[styles.rankText, { color: rankColor }]}>#{item.rank}</Text>
                    </View>

                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.username) }]}>
                        <Text style={styles.avatarText}>{getInitials(item.username)}</Text>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
                        <Text style={[styles.userSubtext, { color: theme.subtext }]}>Grandmaster • Level 50</Text>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <Text style={[styles.ratingValue, { color: theme.text }]}>{item.rating}</Text>
                    <Text style={[styles.ratingLabel, { color: theme.subtext }]}>MMR</Text>
                </View>
            </View>
        );
    };
    return (
        <View style={[styles.root, { backgroundColor: theme.bg }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <View style={styles.headerContent}>
                    <View style={styles.topRow}>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.headerText }]}>Leaderboard</Text>
                            <Text style={[styles.headerSubtitle, { color: theme.headerText }]}>Global Rankings • Season 5</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.themeToggle}>
                            <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: 'rgba(255,255,255,0.2)' }]}>
                        <TextInput
                            style={[styles.searchInput, { color: theme.inputText }]}
                            placeholder="Search player by name..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            selectionColor="#fff"
                        />

                        <TouchableOpacity onPress={handleSimulate} style={styles.simulateBtn} disabled={simulating}>
                            <Text style={styles.simulateText}>{simulating ? '...' : 'Simulate'}</Text>
                        </TouchableOpacity>

                        {searchQuery.length > 0 ? (
                            <TouchableOpacity onPress={() => handleSearch('')} style={styles.iconBtn}>
                                <Text style={styles.iconText}>✕</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.iconBtn}>
                                <Text style={styles.iconText}>🔍</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={[styles.body, { backgroundColor: theme.bg }]}>
                <View style={styles.listHeader}>
                    <Text style={[styles.listSectionTitle, { color: theme.headerBg }]}>{mode === 'search' ? 'SEARCH RESULTS' : 'TOP PLAYERS'}</Text>
                    <Text style={[styles.listSectionSubtitle, { color: theme.subtext }]}>Updated live</Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.headerBg} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.username}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        ...Platform.select({
            web: {
                height: '100%',
                overflow: 'hidden',
            }
        })
    },
    header: {
        paddingTop: Platform.OS === 'web' ? 40 : 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        zIndex: 10,
    },
    headerContent: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 0,
    },
    themeToggle: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        marginBottom: 24,
        opacity: 0.9,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        ...Platform.select({
            web: { outlineStyle: 'none' as any }
        })
    },
    simulateBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    simulateText: {
        color: '#A5B4FC',
        fontSize: 12,
        fontWeight: '600',
    },
    iconBtn: {
        padding: 8,
    },
    iconText: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.8,
    },
    body: {
        flex: 1,
        marginTop: -24,
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingBottom: 20,
        ...Platform.select({
            web: {
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }
        })
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    listSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    listSectionSubtitle: {
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
        minWidth: 60,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: {
        fontSize: 12,
        fontWeight: '800',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    userSubtext: {
        fontSize: 12,
        fontWeight: '500',
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    ratingLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});
