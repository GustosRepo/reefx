import { Dimensions, View } from "react-native";
// @ts-ignore: chart-kit has broken types with Expo SDK 53
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "#000",
  backgroundGradientFrom: "#0f172a",
  backgroundGradientTo: "#0f172a",
  decimalPlaces: 1,
  color: () => "#0ea5e9",
  labelColor: () => "#94a3b8",
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#3b82f6",
  },
};

type Props = {
  parameter: "alk" | "ph" | "cal" | "mag" | "po4" | "no3";
  labels: string[];
  data: number[];
};

export default function TrendChartWrapper({ data, labels, parameter }: Props) {
  const [storedData, setStoredData] = useState<number[]>([]);
  const [storedLabels, setStoredLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("alkHistory", );
        if (savedData) {
          const parsed = JSON.parse(savedData);
          const values = parsed.map((entry: any) => parseFloat(entry[parameter])).slice(-7);
          const dates = parsed.map((entry: any) => entry.date).slice(-7);
          setStoredData(values);
          setStoredLabels(dates);
        } else {
          setStoredData(data);
          setStoredLabels(labels);
        }
      } catch (error) {
        console.error("Failed to load chart data from AsyncStorage", error);
        setStoredData(data);
        setStoredLabels(labels);
      }
    };

    fetchData();
  }, []);

  const sanitizedData = storedData.map((val) => {
    const n = Number(val);
    return isFinite(n) && !isNaN(n) ? n : 0;
  });

  const fallbackData = sanitizedData.length ? sanitizedData : [0];
  const fallbackLabels = storedLabels.length ? storedLabels : ["N/A"];

  const chartData = {
    labels: fallbackLabels,
    datasets: [
      {
        data: fallbackData,
        color: () => "#3b82f6",
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View>
      {/* @ts-ignore: type conflict workaround */}
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}