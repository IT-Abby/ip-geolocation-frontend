// IPinfoScreen.tsx
import React, { useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "@/scripts/supabase";
import { router } from "expo-router";

interface ASNData {
  asn: string;
  name: string;
  domain: string;
  route: string;
  type: string;
}

interface CompanyData {
  name: string;
  domain: string;
  type: string;
}

interface PrivacyData {
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  relay: boolean;
  hosting: boolean;
  service: string;
}

interface IPInfoData {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: ASNData;
  company?: CompanyData;
  privacy?: PrivacyData;
  error?: {
    title: string;
    message: string;
  };
}

const IPinfoScreen: React.FC = () => {
  const [currentIP, setCurrentIP] = useState<string>("");
  const [searchIP, setSearchIP] = useState<string>("");
  const [ipData, setIpData] = useState<IPInfoData | null>(null);
  const [currentUserIPData, setCurrentUserIPData] = useState<IPInfoData | null>(
    null
  ); // ADDED
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const IPINFO_TOKEN = process.env.EXPO_PUBLIC_IPINFO_TOKEN || "";

  useEffect(() => {
    checkUserAndFetchIP();
  }, []);

  const checkUserAndFetchIP = async (): Promise<void> => {
    try {
      setInitialLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert("Authentication Error", "Please log in to continue");

        return;
      }

      setUserEmail(user.email || "");

      await fetchCurrentIP();
    } catch (error) {
      Alert.alert(
        "Error",
        `Authentication check failed: ${(error as Error).message}`
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCurrentIP = async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://ipinfo.io/json?token=${IPINFO_TOKEN}`
      );
      const data: IPInfoData = await response.json();

      if (response.ok) {
        setCurrentIP(data.ip);
        setIpData(data);
        setCurrentUserIPData(data);

        await saveIPToSupabase(data);
      } else {
        Alert.alert("Error", "Failed to fetch current IP address");
      }
    } catch (error) {
      Alert.alert("Error", `Network error: ${(error as Error).message}`);
    }
  };

  const saveIPToSupabase = async (ipInfo: IPInfoData): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("user_ip_logs").insert({
        user_id: user.id,
        ip_address: ipInfo.ip,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country,
        location: ipInfo.loc,
        timezone: ipInfo.timezone,
        org: ipInfo.org,
        logged_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving IP to Supabase:", error);
      }
    } catch (error) {
      console.error("Error in saveIPToSupabase:", error);
    }
  };

  const fetchIPInfo = async (ip: string): Promise<void> => {
    if (!ip.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid IP address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
      );
      const data: IPInfoData = await response.json();

      if (response.ok && !data.error) {
        setIpData(data);
      } else {
        Alert.alert(
          "Error",
          data.error?.message || "Invalid IP address or API error"
        );
      }
    } catch (error) {
      Alert.alert("Error", `Network error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    fetchIPInfo(searchIP);
  };

  const handleClearSearch = (): void => {
    setSearchIP("");
    if (currentUserIPData) {
      setIpData(currentUserIPData);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error", "Failed to log out");
        return;
      }
      router.replace("/login/page");
    } catch (error) {
      Alert.alert("Error", `Logout failed: ${(error as Error).message}`);
    }
  };
  const renderInfoRow = (
    label: string,
    value: string | undefined
  ): JSX.Element | null => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7461F4" />
        <Text style={styles.loadingText}>
          Authenticating and fetching IP...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>IP Information Lookup</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <Text style={styles.currentIP}>Your IP: {currentIP}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter IP address"
          value={searchIP}
          onChangeText={setSearchIP}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchIP ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {ipData && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>IP Details</Text>

          {renderInfoRow("IP Address", ipData.ip)}
          {renderInfoRow("Hostname", ipData.hostname)}

          {ipData.city && (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              {renderInfoRow("City", ipData.city)}
              {renderInfoRow("Region", ipData.region)}
              {renderInfoRow("Country", ipData.country)}
              {renderInfoRow("Postal Code", ipData.postal)}
              {renderInfoRow("Timezone", ipData.timezone)}
              {renderInfoRow("Coordinates", ipData.loc)}
            </>
          )}

          {ipData.org && (
            <>
              <Text style={styles.sectionTitle}>Organization</Text>
              {renderInfoRow("Organization", ipData.org)}
            </>
          )}

          {ipData.asn && (
            <>
              <Text style={styles.sectionTitle}>ASN Information</Text>
              {renderInfoRow("ASN", ipData.asn.asn)}
              {renderInfoRow("Name", ipData.asn.name)}
              {renderInfoRow("Domain", ipData.asn.domain)}
              {renderInfoRow("Type", ipData.asn.type)}
            </>
          )}

          {ipData.company && (
            <>
              <Text style={styles.sectionTitle}>Company</Text>
              {renderInfoRow("Name", ipData.company.name)}
              {renderInfoRow("Domain", ipData.company.domain)}
              {renderInfoRow("Type", ipData.company.type)}
            </>
          )}

          {ipData.privacy && (
            <>
              <Text style={styles.sectionTitle}>Privacy Detection</Text>
              {renderInfoRow("VPN", ipData.privacy.vpn ? "Yes" : "No")}
              {renderInfoRow("Proxy", ipData.privacy.proxy ? "Yes" : "No")}
              {renderInfoRow("Tor", ipData.privacy.tor ? "Yes" : "No")}
              {renderInfoRow("Relay", ipData.privacy.relay ? "Yes" : "No")}
              {renderInfoRow("Hosting", ipData.privacy.hosting ? "Yes" : "No")}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#7461F4",
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 5,
  },
  currentIP: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#7461F4",
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default IPinfoScreen;
