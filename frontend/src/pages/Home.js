import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* =====================================================
   ⭐ 스크롤 애니메이션 Hook (재등장/재숨김 반복)
===================================================== */
function useScrollToggle() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisible(true);   // 화면 안 → 보임
        } else {
          setVisible(false);  // 화면 밖 → 숨김
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default function Home() {
  const navigate = useNavigate();

  /* ---- 영상 2개 애니메이션 ---- */
  const [videoRef1, showVideo1] = useScrollToggle();
  const [videoRef2, showVideo2] = useScrollToggle();

  /* ---- 스크롤 섹션 텍스트/이미지 ---- */
  const [scrollLeftRef, showLeft] = useScrollToggle();
  const [scrollRightRef, showRight] = useScrollToggle();

  /* ⭐ 새로 추가되는 Reverse 섹션 애니메이션 Hook */
  const [revLeftRef, showRevLeft] = useScrollToggle();
  const [revRightRef, showRevRight] = useScrollToggle();

  return (
    <Container>

      {/* ---- HERO SECTION ---- */}
      <HeroSection>
        <HeroLeft>
          <HeroTitle>UMPA</HeroTitle>
          <HeroSubtitle>
            웹에서 바로 사용할 수 있는 최신 피치 분석·시각화 도구
          </HeroSubtitle>

          <HeroButton onClick={() => navigate("/live")}>
            🎤 지금 바로 실시간 피치 측정을 시작하세요!
          </HeroButton>

          <HeroSubLink onClick={() => navigate("/upload")}>
            또는 오디오 파일을 업로드하여 분석하기
          </HeroSubLink>
        </HeroLeft>

        <HeroRight>
          <HeroImage src="/images/laptop.png" alt="Laptop" />
        </HeroRight>
      </HeroSection>

      {/* ---- FEATURE SECTION ---- */}
      <FeatureSection>
        <FeatureTitle>All you need to create</FeatureTitle>

        <FeatureGrid>

          <FeatureCard>
            <FeatureIcon>💻</FeatureIcon>
            <FeatureCardTitle>직관적 인터페이스</FeatureCardTitle>
            <FeatureCardText>
              전문 지식 없이도 바로 사용할 수 있도록 설계된 사용자 인터페이스
            </FeatureCardText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔄</FeatureIcon>
            <FeatureCardTitle>정확하고 안정적인 피치 분석</FeatureCardTitle>
            <FeatureCardText>
              전문 프로그램 수준의 높은 분석 정확도 제공
            </FeatureCardText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🎧</FeatureIcon>
            <FeatureCardTitle>실시간 측정+시각화 제공</FeatureCardTitle>
            <FeatureCardText>
              파형과 피치를 즉시 시각화해 학습·교정 효과 극대화
            </FeatureCardText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureCardTitle>사용자 맞춤형 학습 환경</FeatureCardTitle>
            <FeatureCardText>
              개인 목적에 맞는 피드백 환경 제공
            </FeatureCardText>
          </FeatureCard>

        </FeatureGrid>
      </FeatureSection>

      {/* ---- VIDEO SECTION (스크롤애니메이션 적용) ---- */}
      <VideoSection>

        <FadeUpItem ref={videoRef1} className={showVideo1 ? "show" : ""}>
          <VideoCard>
            <VideoBox />
            <VideoTitle>Short Video #1</VideoTitle>
            <VideoSubtitle>실시간 측정 방법</VideoSubtitle>
          </VideoCard>
        </FadeUpItem>

        <FadeUpItem ref={videoRef2} className={showVideo2 ? "show" : ""}>
          <VideoCard>
            <VideoBox />
            <VideoTitle>Short Video #2</VideoTitle>
            <VideoSubtitle>비교 분석 방법</VideoSubtitle>
          </VideoCard>
        </FadeUpItem>

      </VideoSection>

      {/* ---- SCROLL SECTION (텍스트 왼쪽 / 이미지 오른쪽) ---- */}
      <ScrollSection>

        <SlideLeft ref={scrollLeftRef} className={showLeft ? "show" : ""}>
          <ScrollTitle>발음의 높낮이와 억양을 눈으로 확인하고, 원어민에 더 가까운 발음을 완성하세요.</ScrollTitle>
          <ScrollText>
          많은 학습자들은 외국어 발음이 정확한지 확인하고 싶어 하지만,
          기존 도구들은 발음 교정을 위한 피드백이 부족하거나 부정확한 경우가 많습니다.
          UMPA는 음성의 높낮이, 억양, 발성 패턴을 시각적으로 분석하여
          더 자연스럽고 명확한 발음으로 교정할 수 있도록 돕습니다.
          </ScrollText>
        </SlideLeft>

        <SlideRight ref={scrollRightRef} className={showRight ? "show" : ""}>
          <ScrollImage src="/images/analysis_demo.png" alt="analysis" />
        </SlideRight>

      </ScrollSection>

      {/* ⭐⭐⭐ ---- NEW SECTION (텍스트 오른쪽 / 이미지 왼쪽) ---- ⭐⭐⭐ */}

      <ScrollSectionReverse>

        <SlideRight ref={revRightRef} className={showRevRight ? "show" : ""}>
          <ScrollTitle>악기의 음정을 실시간으로 확인하며 더욱 정확한 튜닝을 완성하세요</ScrollTitle>
          <ScrollText>
            기타·피아노·바이올린 등 다양한 악기의 음 높이를 즉시 측정하고
            오차를 시각적으로 표시해 보다 정밀한 조율을 돕습니다
          </ScrollText>
        </SlideRight>

        <SlideLeft ref={revLeftRef} className={showRevLeft ? "show" : ""}>
          <ScrollImage src="/images/voice_left.png" alt="voice-graph" />
        </SlideLeft>

      </ScrollSectionReverse>

    </Container>
  );
}



/* =====================================================
   CSS (애니메이션 포함)
===================================================== */

const Container = styled.div`
  width: 100%;
  padding: 40px;
`;

/* ---------------------------------- HERO ---------------------------------- */

const HeroSection = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  background: linear-gradient(90deg, #0D1B3D, #132E6B);
  padding: 80px 80px;
  display: flex;
  align-items: center;
  margin-bottom: 80px;

  @media (max-width: 900px) {
    padding: 40px 30px;
    flex-direction: column;
  }
`;

const HeroLeft = styled.div`
  flex: 1.2;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 44px;
  font-weight: 800;
`;

const HeroSubtitle = styled.p`
  margin-top: 15px;
  font-size: 20px;
  opacity: 0.85;
`;

const HeroButton = styled.button`
  margin-top: 20px;
  background: #FFCC00;
  color: #0D1B3D;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #FFD840;
    transform: translateY(-4px);
  }
`;

const HeroSubLink = styled.div`
  margin-top: 10px;
  font-size: 15px;
  text-decoration: underline;
  opacity: 0.8;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const HeroRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const HeroImage = styled.img`
  width: 420px;
  border-radius: 10px;
`;

/* ----------------------------- FEATURE SECTION ----------------------------- */

const FeatureSection = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const FeatureTitle = styled.h2`
  text-align: center;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: 700;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const FeatureCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);

  /* ⭐ 추가된 hover 확대 효과 */
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  }
`;


const FeatureIcon = styled.div`
  font-size: 32px;
`;

const FeatureCardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
`;

const FeatureCardText = styled.p`
  opacity: 0.8;
  font-size: 15px;
`;

/* ----------------------------- VIDEO SECTION ------------------------------ */

const VideoSection = styled.div`
  margin-top: 80px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
`;

const VideoCard = styled.div`
  background: white;
  padding: 18px;
  border-radius: 18px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.1);
`;

const VideoBox = styled.div`
  width: 100%;
  height: 260px;
  background: #d6e1ff;
  border-radius: 14px;
`;

const VideoTitle = styled.h3`
  margin-top: 14px;
  font-size: 20px;
  font-weight: 700;
`;

const VideoSubtitle = styled.p`
  font-size: 15px;
  opacity: 0.75;
`;

/* ⭐ 영상 Fade Up 애니메이션 */
const FadeUpItem = styled.div`
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s ease;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* --------------------------- SCROLL SECTION ---------------------------- */

const ScrollSection = styled.div`
  margin-top: 120px;
  display: flex;
  align-items: center;
  gap: 60px;

  @media (max-width: 900px) {
    flex-direction: column;
    text-align: center;
  }
`;

/* ⭐ 좌측 텍스트 슬라이드 */
const SlideLeft = styled.div`
  flex: 1;
  opacity: 0;
  transform: translateX(-60px);
  transition: all 0.7s ease;

  &.show {
    opacity: 1;
    transform: translateX(0);
  }
`;

/* ⭐ 우측 이미지 슬라이드 */
const SlideRight = styled.div`
  flex: 1;
  opacity: 0;
  transform: translateX(60px);
  transition: all 0.7s ease;

  &.show {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ScrollTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 20px;
`;

const ScrollText = styled.p`
  font-size: 18px;
  opacity: 0.85;
  line-height: 1.6;
`;

const ScrollImage = styled.img`
  width: 95%;
  max-width: 600px;
  border-radius: 18px;
  box-shadow: 0 5px 18px rgba(0,0,0,0.15);
`;

/* ⭐⭐⭐ 추가된 새로운 섹션 (이미지 왼쪽 / 텍스트 오른쪽) ⭐⭐⭐ */
const ScrollSectionReverse = styled.div`
  margin-top: 120px;
  display: flex;
  align-items: center;
  gap: 60px;

  flex-direction: row-reverse;

  @media (max-width: 900px) {
    flex-direction: column;
    text-align: center;
  }
`;
