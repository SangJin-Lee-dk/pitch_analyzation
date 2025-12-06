import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Pitchfinder from "pitchfinder";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

export default function Analyze() {
  const { state } = useLocation();
  const file = state?.file;

  const [loading, setLoading] = useState(true);
  const [minHz, setMinHz] = useState(null);
  const [maxHz, setMaxHz] = useState(null);
  const [avgHz, setAvgHz] = useState(null);
  const [data, setData] = useState([]);
  
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);

  const [currentTime, setCurrentTime] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);

        const detectPitch = Pitchfinder.YIN({
          sampleRate: audioContext.sampleRate,
          threshold: 0.005,
        });

        const frameSize = 2048;
        const results = [];

        setAudioBuffer(audioBuffer);
        setAudioContext(audioContext);

        for (let i = 0; i < channelData.length; i += frameSize) {
          const frame = channelData.slice(i, i + frameSize);  
          const freq = detectPitch(frame);

          // 50~5000Hz 범위를 벗어나면 무음(0) 취급하거나 null 처리
          const isValid = freq && freq > 50 && freq < 5000;

          if (isValid) {
            results.push({
              time: (i / audioContext.sampleRate).toFixed(2),
              hz: freq,
            });
          } else {
            // 🔥 [수정 포인트 1] 
            // 분석 단계에서 끊김을 확실히 표현하기 위해 
            // 유효하지 않은 구간은 0을 넣거나 아예 건너뛸 수 있습니다.
            // 여기서는 그래프 렌더링 시 null 처리를 위해 '0'으로 채워둡니다.
            results.push({
              time: (i / audioContext.sampleRate).toFixed(2),
              hz: 0, 
            });
          } 
        }

        if (results.length === 0) {
          alert("피치를 검출할 수 없습니다.");
          setLoading(false);
          return;
        }

        // -------------------------
        // ✨ [추가] 짧은 끊김 보정 로직 적용
        // -------------------------
        const smoothResults = fillShortGaps(results, 20);

        // 통계 계산 시 보정된 데이터 사용
        const freqs = smoothResults.map((v) => v.hz).filter(hz => hz > 0);
        
        if (freqs.length > 0) {
            const min = Math.min(...freqs).toFixed(1);
            const max = Math.max(...freqs).toFixed(1);
            const avg = (freqs.reduce((a, b) => a + b, 0) / freqs.length).toFixed(1);
            setMinHz(min);
            setMaxHz(max);
            setAvgHz(avg);
        } else {
            // 유효한 피치가 하나도 없을 경우
            setMinHz(0); setMaxHz(0); setAvgHz(0);
        }

        setData(smoothResults);

      } catch (err) {
        console.error("파일 분석 오류:", err);
        alert("파일 분석 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  const play = () => {
    if (!audioContext || !audioBuffer) return;
    if (sourceNode) sourceNode.stop();

    const newSource = audioContext.createBufferSource();
    newSource.buffer = audioBuffer;
    newSource.connect(audioContext.destination);
    newSource.start(0, currentTime);

    const startAt = audioContext.currentTime - currentTime;

    const update = () => {
      const t = audioContext.currentTime - startAt;
      setCurrentTime(t);
      if (t < audioBuffer.duration && isPlaying) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);

    setSourceNode(newSource);
    setIsPlaying(true);
  };

  const pause = () => {
    if (sourceNode) sourceNode.stop();
    setIsPlaying(false);
  };

  // 🔥 [수정 포인트 2] 렌더링 직전에 데이터 변환 (0 -> null)
  // 이렇게 해야 차트 전체(Y축 포함)가 null을 인식하고 올바르게 줌인(Zoom-in)합니다.
  const chartData = data.map((d) => ({
    ...d,
    hz: d.hz <= 0 ? null : d.hz, // 0 이하는 null로 변환
  }));

  const fillShortGaps = (data, maxGapFrame) => {
    const processed = [...data];
    let lastValidHz = null;
    let gapIndices = [];

    for (let i = 0; i < processed.length; i++) {
      const currentHz = processed[i].hz;

      if (currentHz > 0) {
        // 유효한 값이 나왔을 때
        if (gapIndices.length > 0) {
          // 갭이 허용 범위 이내이고, 이전 유효 값이 있다면 채움
          if (gapIndices.length <= maxGapFrame && lastValidHz !== null) {
            for (const index of gapIndices) {
              processed[index].hz = lastValidHz;
            }
          }
          gapIndices = []; // 갭 초기화
        }
        lastValidHz = currentHz; // 마지막 유효 값 갱신
      } else {
        // 값이 0이면 인덱스 적립
        gapIndices.push(i);
      }
    }
    
    return processed;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 File Pitch Analysis</h1>

      {file && <p style={styles.filename}>분석 파일: <b>{file.name}</b></p>}

      {loading && (
        <div style={styles.loadingBox}>
          <div className="spinner" style={styles.spinner}></div>
          <p style={styles.loadingText}>🔄 분석 중입니다… 잠시만 기다려주세요.</p>
        </div>
      )}

      {!loading && minHz && (
        <div style={styles.infoBox}>
          <p>최저 Hz: {minHz}</p>
          <p>최고 Hz: {maxHz}</p>
          <p>평균 Hz: {avgHz}</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {!isPlaying ? (
            <button onClick={play}>▶ 재생</button>
          ) : (
            <button onClick={pause}>⏸ 일시정지</button>
          )}
        </div>
      )}

      {!loading && data.length > 0 && (
        <ResponsiveContainer width="95%" height={400}>
          {/* 🔥 [수정 포인트 3] LineChart에 변환된 chartData 주입 */}
          <LineChart 
            data={chartData}
            onClick={(e) => {
              if (e && e.activeLabel) {
                setCurrentTime(parseFloat(e.activeLabel));
              }
            }}
          >
            {/* 🔥 [수정 포인트 4] YAxis 도메인을 'auto'로 설정하여 줌인 효과 적용 */}
            <YAxis 
                domain={['auto', 'auto']} 
                tickCount={10} 
                width={40}
            />
            
            <XAxis dataKey="time" />
            <Tooltip />
            <ReferenceLine x={currentTime.toFixed(2)} stroke="red" />

            {/* 🔥 [수정 포인트 5] connectNulls={false} 적용 */}
            <Line 
              type="monotone" 
              dataKey="hz" 
              stroke="#FFD940" 
              dot={false} 
              connectNulls={false} // 무음 구간(null)은 선을 잇지 않음
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const styles = {
  // ... (기존 스타일과 동일)
  container: {
    padding: "50px",
    textAlign: "center",
    color: "#fff",
    background: "linear-gradient(135deg, #0D1B3D, #102C5B)",
    minHeight: "100vh",
  },
  title: { fontSize: "36px", marginBottom: "10px" },
  filename: { fontSize: "18px", opacity: 0.9, marginBottom: "30px" },
  loadingBox: { marginTop: "60px", marginBottom: "40px" },
  spinner: {
    margin: "0 auto",
    border: "6px solid rgba(255,255,255,0.3)",
    borderTop: "6px solid #FFD940",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: "15px", fontSize: "18px", opacity: 0.9 },
  infoBox: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "10px",
    display: "inline-block",
    marginBottom: "30px",
    fontSize: "18px",
  },
};

const styleSheet = document.styleSheets[0];
try {
    styleSheet.insertRule(`
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    `, styleSheet.cssRules.length);
} catch (e) {}