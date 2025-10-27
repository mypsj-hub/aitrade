# 1. 파일 상단에 altair 대신 plotly.express를 import 해주세요.
import plotly.express as px
import pandas as pd
import streamlit as st
from typing import Dict
from datetime import datetime, timedelta
import sqlite3
import json
import math

# =============================================================================
# 2. 페이지 설정 및 전문적 스타일링 (기존 코드 유지)
# =============================================================================
st.set_page_config(
    page_title="AI Trading Dashboard",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

PROFESSIONAL_CSS = """
<style>
    /* 전체 앱 기본 스타일 */
    .stApp {
        background-color: #FAFBFC;
        color: #1A1A1A;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* 헤더 및 제목 스타일 - 기본 크기로 수정 */
    h1, h2, h3, h4, h5, h6 {
        color: #1E3A8A; 
        font-weight: 700; 
        margin-bottom: 1rem;
    }
    
    /* 메인 컨테이너 패딩 조정 */
    .block-container {
        padding-top: 2rem; padding-bottom: 1rem; padding-left: 1.5rem; padding-right: 1.5rem; max-width: 1200px;
    }
    
    /* 메트릭 카드 스타일링 */
    [data-testid="stMetric"] {
        background: linear-gradient(145deg, #FFFFFF, #F1F5F9);
        border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s ease;
    }
    
    [data-testid="stMetric"]:hover {
        transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 13px !important; font-weight: 600; color: #64748B;
        text-transform: uppercase; letter-spacing: 0.5px;
    }
    
    /* 메트릭 값의 내부 div를 타겟하여 폰트 크기 강제 적용 */
    [data-testid="stMetricValue"] div {
    font-size: 1rem !important; /* 폰트 크기를 1rem (일반 크기)으로 변경 */
    font-weight: 700; 
    color: #1E3A8A;
    }
    
    /* 탭 스타일링 */
    [data-testid="stTabs"] button {
        font-size: 15px; font-weight: 600; padding: 0.75rem 1.5rem;
        border-radius: 8px 8px 0 0; background-color: #F8FAFC; color: #64748B;
        border: 1px solid #E2E8F0; margin-right: 2px;
    }
    
    [data-testid="stTabs"] button[aria-selected="true"] {
        background-color: #1E3A8A; color: #FFFFFF; border-color: #1E3A8A;
    }
    
    /* 데이터프레임 스타일링 */
    .stDataFrame {
        border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;
    }
    
    /* 정보 카드 스타일 */
    .info-card {
        background: linear-gradient(145deg, #EFF6FF, #DBEAFE);
        border: 1px solid #3B82F6; border-radius: 10px;
        padding: 1.5rem; margin-top: 1rem;
    }
    
    /* 성공/실패 색상 */
    .profit-positive { color: #DC2626; font-weight: 700; }
    .profit-negative { color: #2563EB; font-weight: 700; }
    
    /* 상태 배지 스타일 */
    .status-badge {
        display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px;
        font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    
    .status-holding { background-color: #10B981; color: white; }
    .status-not-holding { background-color: #6B7280; color: white; }
    .status-active { background-color: #3B82F6; color: white; }
    .status-reevaluate { background-color: #F59E0B; color: white; }
    .status-excluded { background-color: #EF4444; color: white; }
    
    /* 코인 카드 스타일 */
    .coin-card {
        background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px;
        padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    
    .coin-card:hover {
        border-color: #3B82F6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    
    .coin-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }
    
    .coin-name {
        font-size: 18px; font-weight: 700; color: #1F2937;
    }

    .reason-box {
        background-color: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 8px;
        padding: 1rem; font-size: 13px; color: #374151;
        white-space: pre-wrap; word-wrap: break-word;
    }
    
    /* 반응형 디자인 */
    @media (max-width: 768px) {
        .block-container {
            padding-left: 1rem; padding-right: 1rem;
        }
        
        [data-testid="stMetricValue"] div {
            font-size: 20px !important;
        }
        
        .coin-card {
            padding: 1rem;
        }
    }
</style>
"""
st.markdown(PROFESSIONAL_CSS, unsafe_allow_html=True)

# =============================================================================
# 3. 데이터베이스 연결 및 데이터 로딩 (기존 코드 유지)
# =============================================================================
@st.cache_data(ttl=60) # 60초 캐싱 추가
def load_portfolio_data() -> Dict:
    conn = get_db_connection()
    if not conn: return {}
    try:
        holdings_df = pd.read_sql_query("SELECT * FROM holding_status ORDER BY 평가금액 DESC, 코인이름 ASC", conn)
        summary_df = pd.read_sql_query("SELECT * FROM portfolio_summary ORDER BY 날짜 DESC LIMIT 1", conn)
        summary_full_df = pd.read_sql_query("SELECT * FROM portfolio_summary ORDER BY 날짜 ASC", conn)
        cio_df = pd.read_sql_query("SELECT status_value FROM system_status WHERE status_key = 'cio_latest_rationale'", conn)
        history_df = pd.read_sql_query("SELECT * FROM trade_history ORDER BY 거래일시 DESC LIMIT 1000", conn)
        reports_df = pd.read_sql_query("SELECT * FROM cio_reports ORDER BY report_date DESC", conn)
        return { 
            "holdings": holdings_df, 
            "summary": summary_df, 
            "summary_full": summary_full_df,
            "cio_rationale": cio_df['status_value'].iloc[0] if not cio_df.empty else "CIO 브리핑이 아직 생성되지 않았습니다.", 
            "history": history_df, 
            "reports": reports_df 
        }
    except Exception as e:
        st.error(f"🚨 데이터 로딩 중 오류 발생: {e}")
        return {}
    finally:
        if conn: conn.close()

def get_db_connection():
    try:
        return sqlite3.connect('file:multi_coin_trades.db?mode=ro', uri=True)
    except sqlite3.Error as e:
        st.error(f"🚨 데이터베이스 연결 실패: {e}")
        return None

def calculate_portfolio_stats(holdings_df: pd.DataFrame, history_df: pd.DataFrame) -> Dict:
    sell_pattern = '매도|익절|손절|청산'
    if holdings_df.empty or '보유수량' not in holdings_df.columns:
        holding_coins_count = 0
    else:
        holding_coins_count = len(holdings_df[holdings_df['보유수량'] > 0])
    stats = {
        "total_trades": len(history_df),
        "buy_trades": len(history_df[history_df['거래유형'].str.contains('매수', na=False)]),
        "sell_trades": len(history_df[history_df['거래유형'].str.contains(sell_pattern, na=False, regex=True)]),
        "holding_coins": holding_coins_count,
        "total_coins": len(holdings_df),
    }
    sell_trades = history_df[history_df['거래유형'].str.contains(sell_pattern, na=False, regex=True)]
    if not sell_trades.empty and '수익금' in sell_trades.columns:
        profit_trades = sell_trades[sell_trades['수익금'] > 0]
        stats["win_rate"] = len(profit_trades) / len(sell_trades) * 100 if len(sell_trades) > 0 else 0
    else:
        stats["win_rate"] = 0
    return stats
    
# =============================================================================
# 4. 시각화 및 UI 컴포넌트 (기존 코드 유지)
# =============================================================================
def display_key_metrics(summary_data: pd.DataFrame, holdings_data: pd.DataFrame) -> None:
    total_value, krw_balance, daily_return, total_return, total_purchase = 0, 0, 0, 0, 0
    if not summary_data.empty:
        latest_summary = summary_data.iloc[0]
        total_value = latest_summary.get('총순자산', 0)
        krw_balance = latest_summary.get('원화잔고', 0)
        daily_return = latest_summary.get('일일수익률', 0)
        total_return = latest_summary.get('누적수익률', 0)
    if not holdings_data.empty:
        total_purchase = holdings_data['매수금액'].sum()
    cols = st.columns(5)
    cols[0].metric("💰 총 자산", f"₩ {total_value:,.0f}", help="현재 보유 중인 총 자산 가치 (코인 평가액 + 현금)")
    cols[1].metric("💵 현금 잔고", f"₩ {krw_balance:,.0f}", help="매매 가능한 원화 잔고")
    cols[2].metric("📈 총 매수금액", f"₩ {total_purchase:,.0f}", help="현재 보유 중인 코인들의 총 매수 원금")
    cols[3].metric("☀️ 일일 수익률", f"{daily_return:+.2f}%", help="24시간 전 대비 총 자산 변화율")
    cols[4].metric("📊 누적 수익률", f"{total_return:+.2f}%", help="투자 시작 시점 이후의 총 누적 수익률")

def create_portfolio_allocation_chart(holdings_df: pd.DataFrame, summary_df: pd.DataFrame) -> None:
    if holdings_df.empty:
        st.info("📊 표시할 포트폴리오 데이터가 없습니다.")
        return
    holding_coins = holdings_df[holdings_df['보유수량'] > 0].copy()
    krw_balance = summary_df.iloc[0].get('원화잔고', 0) if not summary_df.empty else 0
    if holding_coins.empty and krw_balance <= 0:
        st.info("📊 현재 보유 중인 자산이 없습니다.")
        return
    chart_data = holding_coins[['코인이름', '평가금액']].copy()
    if krw_balance > 0:
        cash_row = pd.DataFrame([{'코인이름': '현금 (KRW)', '평가금액': krw_balance}])
        chart_data = pd.concat([chart_data, cash_row], ignore_index=True)
    st.subheader("🥧 포트폴리오 자산 배분")
    total_value = chart_data['평가금액'].sum()
    if total_value == 0:
        st.info("📊 자산 가치가 0이므로 배분 차트를 표시할 수 없습니다.")
        return
    chart_data['비중(%)'] = (chart_data['평가금액'] / total_value * 100)
    chart_data_for_bar = chart_data.set_index('코인이름')['비중(%)']
    st.bar_chart(chart_data_for_bar, height=300)
    display_data = chart_data[['코인이름', '평가금액', '비중(%)']].sort_values('평가금액', ascending=False)
    display_data['평가금액'] = display_data['평가금액'].apply(lambda x: f"₩ {x:,.0f}")
    display_data['비중(%)'] = display_data['비중(%)'].apply(lambda x: f"{x:.1f}%")
    st.dataframe(display_data.rename(columns={'코인이름': '자산', '평가금액': '평가액', '비중(%)': '비중'}),
                 use_container_width=True, hide_index=True)

def display_cio_briefing(cio_rationale: str) -> None:
    st.subheader("🎯 최신 AI 투자 전략 브리핑")
    st.markdown(f'<div class="info-card"><h4>📋 Chief Investment Officer (CIO) 브리핑</h4><div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">{cio_rationale}</div></div>', unsafe_allow_html=True)

def display_holding_summary(holdings_df: pd.DataFrame) -> None:
    st.subheader("💎 현재 보유 자산 현황")
    holding_assets = holdings_df[holdings_df['보유수량'] > 0].copy()
    if holding_assets.empty:
        st.info("🔭 현재 보유 중인 코인이 없습니다.")
        return
    display_data = holding_assets[['코인이름', '수익률', '평가금액', '보유비중']].sort_values('평가금액', ascending=False)
    display_data.columns = ['코인', '수익률', '평가액', '비중']
    st.dataframe(display_data, use_container_width=True, hide_index=True,
                 column_config={"수익률": st.column_config.NumberColumn(format="%.2f%%"),
                                "평가액": st.column_config.NumberColumn(format="₩ %d"),
                                "비중": st.column_config.NumberColumn(format="%.1f%%")})

def display_enhanced_coin_card(coin_data: pd.Series) -> None:
    status_colors = {'보유': '🟢', '미보유': '⚪'}
    management_colors = {'활성': '🔵', '재평가': '🟡', '제외': '🔴'}
    decision_colors = {'신규매수': '🔴', '추가매수': '🟠', '부분익절': '🔵', '전량익절': '🟦', 
                      '부분손절': '🔻', '전량손절': '⬇️', '매매보류': '⏸️', '신규편입': '🟣'}
    
    coin_name = coin_data.get('코인이름', 'N/A')
    current_status = coin_data.get('현재상태', 'N/A')
    management_status = coin_data.get('관리상태', 'N/A')
    ai_decision = coin_data.get('매매판단', 'N/A')
    confidence = coin_data.get('판단확신', 0)
    profit_rate = coin_data.get('수익률', 0)
    trade_reason = coin_data.get('거래사유', '사유 없음')
    thinking_process = coin_data.get('ai_thinking_process')
    
    with st.container(border=True):
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown(f"### {coin_name}")
        with col2:
            st.markdown(f"{status_colors.get(current_status, '⚪')} {current_status} | {management_colors.get(management_status, '⚪')} {management_status}")
        
        st.markdown(f"**{decision_colors.get(ai_decision, '⏸️')} AI 판단:** {ai_decision} (확신도: {confidence}점)")
        
        if coin_data.get('보유수량', 0) > 0:
            st.markdown("---")
            evaluation_amount = coin_data.get('평가금액', 0)
            profit_loss = coin_data.get('평가손익', 0)
            holding_ratio = coin_data.get('보유비중', 0)
            target_ratio = coin_data.get('GPT보유비중', 0)
            avg_price = coin_data.get('매수평균가', 0)
            profit_emoji = "📈" if profit_rate >= 0 else "📉"
            profit_sign = "+" if profit_rate >= 0 else ""
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"**평가금액:** ₩ {evaluation_amount:,.0f}")
                st.markdown(f"**평균단가:** ₩ {avg_price:,.0f}")
            with col2:
                st.markdown(f"**수익률:** {profit_emoji} {profit_sign}{profit_rate:.2f}% (₩ {profit_loss:+,.0f})")
                st.markdown(f"**비중:** {holding_ratio:.1f}% (목표: {target_ratio:.1f}%)")
        
        st.markdown("---")
        st.markdown("**🧠 AI 분석 상세**")
        st.markdown(f"**거래 판단 근거:** {trade_reason}")
        if thinking_process and str(thinking_process) != 'nan' and str(thinking_process).strip():
            with st.expander("상세 분석 보기", expanded=False):
                st.text_area(
                    "AI Thinking Process",
                    value=str(thinking_process),
                    height=150,
                    disabled=True,
                    label_visibility="collapsed"
                )

def get_trades_for_date(selected_date: str, history_df: pd.DataFrame) -> pd.DataFrame:
    try:
        start_time = datetime.strptime(selected_date, '%Y-%m-%d')
        end_time = start_time + timedelta(days=1)
        history_df_copy = history_df.copy()
        history_df_copy['거래일시_dt'] = pd.to_datetime(history_df_copy['거래일시'], errors='coerce')
        history_df_copy.dropna(subset=['거래일시_dt'], inplace=True)
        date_trades = history_df_copy[
            (history_df_copy['거래일시_dt'] >= start_time) & 
            (history_df_copy['거래일시_dt'] < end_time)
        ].sort_values('거래일시_dt', ascending=False)
        return date_trades
    except Exception as e:
        st.error(f"거래 기록 조회 중 오류: {e}")
        return pd.DataFrame()

def display_daily_trades(trades_df: pd.DataFrame, selected_date: str) -> None:
    st.subheader(f"🔍 {selected_date} 거래 기록")
    if trades_df.empty:
        st.info("해당 날짜에 발생한 거래가 없습니다.")
        return
    total_trades, buy_trades = len(trades_df), len(trades_df[trades_df['거래유형'].str.contains('매수', na=False)])
    sell_pattern = '매도|익절|손절|청산'
    sell_trades = len(trades_df[trades_df['거래유형'].str.contains(sell_pattern, na=False, regex=True)])
    col1, col2, col3 = st.columns(3)
    col1.metric("총 거래 건수", total_trades); col2.metric("매수 거래", buy_trades); col3.metric("매도 거래", sell_trades)
    st.markdown("---")
    for _, trade in trades_df.iterrows():
        trade_time = pd.to_datetime(trade['거래일시']).strftime('%H:%M:%S')
        emoji, color = ("🔼", "#EF4444") if '매수' in trade['거래유형'] else ("🔽", "#3B82F6")
        with st.container(border=True):
            cols = st.columns([1, 1, 1, 4])
            cols[0].markdown(f"**⏰ {trade_time}**"); cols[1].markdown(f"**💰 {trade['코인이름']}**")
            cols[2].markdown(f"<span style='color: {color};'>{emoji} **{trade['거래유형']}**</span>", unsafe_allow_html=True)
            cols[3].caption(f"💡 {trade['거래사유']}")

# =============================================================================
# 5. 메인 탭 함수들 (show_periodic_reports 함수 수정됨)
# =============================================================================
def show_main_dashboard(data: Dict) -> None:
    st.header("🏠 메인 대시보드")
    st.markdown("---")
    display_key_metrics(data.get('summary', pd.DataFrame()), data.get('holdings', pd.DataFrame()))
    st.markdown("---")
    display_holding_summary(data.get('holdings', pd.DataFrame()))
    st.write("")
    create_portfolio_allocation_chart(data.get('holdings', pd.DataFrame()), data.get('summary', pd.DataFrame()))
    st.markdown("---")
    display_cio_briefing(data.get('cio_rationale', 'CIO 브리핑이 없습니다.'))

# [수정] show_periodic_reports 함수에 필터링 기능 추가
def show_periodic_reports(data: Dict) -> None:
    st.header("📈 기간별 리포트")
    st.markdown("---")
    reports_df, history_df = data.get('reports', pd.DataFrame()), data.get('history', pd.DataFrame())
    if reports_df.empty:
        st.warning("📋 생성된 보고서가 없습니다.")
        return
        
    # --- 보고서 선택 UI ---
    col1, col2 = st.columns([1, 2])
    report_types = {'일일': 'DAILY', '주간': 'WEEKLY', '월간': 'MONTHLY'}
    selected_type_label = col1.selectbox("📊 보고서 유형", options=list(report_types.keys()))
    selected_type = report_types[selected_type_label]
    available_dates = sorted(reports_df[reports_df['report_type'] == selected_type]['report_date'].unique(), reverse=True)
    if not available_dates:
        col2.warning(f"📅 {selected_type_label} 보고서가 없습니다.")
        return
    selected_date = col2.selectbox("📅 보고서 날짜", options=available_dates)
    if not selected_date: return
    
    st.markdown("---")
    
    # --- 보고서 내용 표시 ---
    selected_report = reports_df[(reports_df['report_type'] == selected_type) & (reports_df['report_date'] == selected_date)]
    if selected_report.empty:
        st.error("선택한 조건의 보고서를 찾을 수 없습니다.")
        return
    report_data = selected_report.iloc[0]
    st.subheader(f"📋 {selected_date} {selected_type_label} 보고서")
    if 'full_content_md' in report_data and pd.notna(report_data['full_content_md']):
        st.markdown(report_data['full_content_md'], unsafe_allow_html=True)
    else:
        st.info("보고서 내용이 없습니다.")
        
    # --- [추가] 일일 보고서 선택 시에만 거래 기록 필터링 기능 표시 ---
    if selected_type == 'DAILY':
        st.markdown("---")
        
        # 1. 선택된 날짜의 전체 거래 기록 가져오기
        daily_trades = get_trades_for_date(selected_date, history_df)
        
        if not daily_trades.empty:
            st.subheader(f"🔍 {selected_date} 거래 기록 필터링")
            
            # 2. 필터링 UI 위젯 생성
            cols_filter = st.columns([1, 2])
            search_coin = cols_filter[0].text_input("코인명 검색", key=f"search_coin_{selected_date}")
            
            trade_types = sorted(daily_trades['거래유형'].unique().tolist())
            selected_types = cols_filter[1].multiselect("거래 유형", options=trade_types, default=trade_types, key=f"types_{selected_date}")
            
            # 3. 필터링 로직 적용
            filtered_trades = daily_trades.copy()
            if search_coin:
                filtered_trades = filtered_trades[filtered_trades['코인이름'].str.contains(search_coin, case=False, na=False)]
            if selected_types:
                filtered_trades = filtered_trades[filtered_trades['거래유형'].isin(selected_types)]
            
            # 4. 필터링된 결과 표시
            display_daily_trades(filtered_trades, selected_date)
        else:
            # 해당 날짜에 거래가 없는 경우
            st.subheader(f"🔍 {selected_date} 거래 기록")
            st.info("해당 날짜에 발생한 거래가 없습니다.")


def show_portfolio_details(data: Dict) -> None:
    st.header("🪙 포트폴리오 상세")
    st.markdown("---")
    holdings_df = data.get('holdings', pd.DataFrame())
    if holdings_df.empty:
        st.warning("🔍 포트폴리오 데이터가 없습니다.")
        return
    st.subheader("🔍 필터링 및 정렬 옵션")
    cols = st.columns([1, 1, 1, 2])
    status_options = holdings_df['현재상태'].unique().tolist()
    selected_status = cols[0].multiselect("현재 상태", options=status_options, default=status_options)
    management_options = holdings_df['관리상태'].unique().tolist()
    selected_management = cols[1].multiselect("관리 상태", options=management_options, default=management_options)
    sort_options = {"평가금액 (높은 순)": ('평가금액', False), "수익률 (높은 순)": ('수익률', False), "수익률 (낮은 순)": ('수익률', True), "코인명 (가나다순)": ('코인이름', True)}
    selected_sort = cols[2].selectbox("🔀 정렬 기준", options=list(sort_options.keys()))
    filtered_df = holdings_df[(holdings_df['현재상태'].isin(selected_status)) & (holdings_df['관리상태'].isin(selected_management))]
    if filtered_df.empty:
        st.info("🔍 선택한 조건에 맞는 코인이 없습니다.")
        return
    sort_column, ascending = sort_options[selected_sort]
    sorted_df = filtered_df.sort_values(by=sort_column, ascending=ascending)
    st.markdown("---")
    st.subheader(f"💼 코인 상세 정보 ({len(sorted_df)}개)")
    for _, coin in sorted_df.iterrows():
        display_enhanced_coin_card(coin)

def show_trade_history(data: Dict) -> None:
    st.header("📜 전체 거래 기록")
    st.markdown("---")
    history_df, holdings_df = data.get('history', pd.DataFrame()), data.get('history', pd.DataFrame())
    if history_df.empty:
        st.warning("📋 거래 기록이 없습니다.")
        return
    stats = calculate_portfolio_stats(holdings_df, history_df)
    st.subheader("📊 거래 성과 통계")
    cols = st.columns(4)
    cols[0].metric("총 거래", f"{stats['total_trades']}회")
    cols[1].metric("매수", f"{stats['buy_trades']}회")
    cols[2].metric("매도", f"{stats['sell_trades']}회")
    cols[3].metric("승률", f"{stats['win_rate']:.1f}%")
    st.markdown("---")
    st.subheader("🔍 검색 및 필터링")
    cols = st.columns([1, 1, 1])
    search_coin = cols[0].text_input("코인명 검색")
    trade_types = sorted(history_df['거래유형'].unique().tolist())
    selected_types = cols[1].multiselect("거래 유형", options=trade_types, default=trade_types)
    date_filter = cols[2].selectbox("기간 필터", options=["전체", "최근 7일", "최근 30일"])
    filtered_history = history_df.copy()
    if search_coin:
        filtered_history = filtered_history[filtered_history['코인이름'].str.contains(search_coin, case=False, na=False)]
    if selected_types:
        filtered_history = filtered_history[filtered_history['거래유형'].isin(selected_types)]
    if date_filter != "전체":
        days = 7 if date_filter == "최근 7일" else 30
        cutoff_date = datetime.now() - timedelta(days=days)
        filtered_history['거래일시_dt'] = pd.to_datetime(filtered_history['거래일시'])
        filtered_history = filtered_history[filtered_history['거래일시_dt'] >= cutoff_date]
    st.markdown("---")
    st.subheader(f"📋 거래 기록 ({len(filtered_history)}건)")
    if filtered_history.empty:
        st.info("🔍 선택한 조건에 맞는 거래 기록이 없습니다.")
        return
    display_cols = ['거래일시', '코인이름', '거래유형', '거래금액', '수익금', '거래사유']
    st.dataframe(filtered_history[display_cols].reset_index(drop=True), use_container_width=True, height=600,
                 column_config={"거래일시": st.column_config.DatetimeColumn("시간", format="YYYY-MM-DD HH:mm"),
                                "거래금액": st.column_config.NumberColumn(format="₩ %,d"),
                                "수익금": st.column_config.NumberColumn(format="₩ %,d")})

def show_asset_status_tab(data: Dict) -> None:
    st.header("📊 자산 현황")
    st.markdown("---")
    
    BASE_AMOUNT = 10003116

    summary_df = data.get('summary_full', pd.DataFrame())
    
    if summary_df.empty:
        st.warning("📈 자산 변동 기록이 없어 차트를 생성할 수 없습니다.")
        return

    if '날짜' not in summary_df.columns or summary_df['날짜'].isnull().all():
        st.error("🚨 '날짜' 데이터가 없어 차트를 그릴 수 없습니다. DB 데이터를 확인해주세요.")
        return
        
    df = summary_df.copy()
    df.dropna(subset=['날짜', '총순자산'], inplace=True)
    df['일자'] = pd.to_datetime(df['날짜']).dt.date
    daily_assets = df.groupby('일자').last().reset_index()
    daily_assets.sort_values(by='일자', inplace=True)

    if daily_assets.empty:
        st.warning("📈 유효한 자산 기록이 없습니다.")
        return

    st.subheader("📈 일일 자산 변동 추이")
    
    latest_asset = daily_assets['총순자산'].iloc[-1]
    peak_asset = daily_assets['총순자산'].max()
    lowest_asset = daily_assets['총순자산'].min()
    
    current_return = ((latest_asset - BASE_AMOUNT) / BASE_AMOUNT) * 100 if BASE_AMOUNT > 0 else 0
    peak_return = ((peak_asset - BASE_AMOUNT) / BASE_AMOUNT) * 100 if BASE_AMOUNT > 0 else 0
    
    cols = st.columns(4)
    cols[0].metric("💰 기준금액", f"₩ {BASE_AMOUNT:,.0f}")
    cols[1].metric("📊 현재 총자산", f"₩ {latest_asset:,.0f}", f"{current_return:+.2f}%")
    cols[2].metric("📈 최고 자산", f"₩ {peak_asset:,.0f}", f"{peak_return:+.2f}%")
    cols[3].metric("📉 최저 자산", f"₩ {lowest_asset:,.0f}")

    fig = px.line(
        daily_assets,
        x='일자',
        y='총순자산',
        title='총자산 변화 추이',
        labels={'일자': '날짜', '총순자산': '총자산 (원)'},
        markers=True
    )

    fig.update_layout(
        hovermode="x unified",
        height=500,
        xaxis_title=None,
        yaxis_title="자산 가치 (원)",
        legend_title_text=None
    )

    fig.update_xaxes(tickformat='%m/%d')
    fig.update_yaxes(tickformat=",.0f")

    fig.add_hline(
        y=BASE_AMOUNT, 
        line_width=2, 
        line_dash="dash", 
        line_color="red",
        annotation_text="기준금액", 
        annotation_position="bottom right"
    )

    st.plotly_chart(fig, use_container_width=True)
    
    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**📋 차트 정보**")
        st.markdown(f"• 📅 **기간**: {daily_assets['일자'].min()} ~ {daily_assets['일자'].max()}")
        st.markdown(f"• 📊 **데이터**: {len(daily_assets)}일")
    with col2:
        st.markdown("**🔍 차트 사용법**")
        st.markdown("• **마우스 휠/드래그**: 확대/축소/이동")
        st.markdown("• **더블 클릭**: 원래 크기로 복귀")
        st.markdown("• **포인트 호버**: 상세 정보 확인")

# =============================================================================
# 6. 메인 애플리케이션 (기존 코드 유지)
# =============================================================================
def main():
    st.title("📈 AI Trading Dashboard")
    st.markdown('<div style="background: linear-gradient(90deg, #1E3A8A, #3B82F6); padding: 1rem; border-radius: 10px; margin-bottom: 2rem;"><h3 style="color: white; margin: 0; text-align: center;">🤖 인공지능 기반 암호화폐 자동매매 시스템</h3><p style="color: #E5E7EB; margin: 0.5rem 0 0 0; text-align: center; font-size: 14px;">실시간 포트폴리오 모니터링 및 성과 분석 대시보드</p></div>', unsafe_allow_html=True)
    st.caption("💡 **데이터 새로고침:** 브라우저를 새로고침(F5 또는 Ctrl+R)하면 최신 데이터로 업데이트됩니다.")
    with st.spinner("📊 포트폴리오 데이터를 불러오는 중..."):
        portfolio_data = load_portfolio_data()
    if not portfolio_data:
        st.error("🚨 **데이터 로딩 실패**\n\n`multi_coin_trades.db` 파일 연결을 확인해주세요.")
        return
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["🏠 메인 현황", "📊 자산 현황", "📈 기간별 리포트", "🪙 포트폴리오 상세", "📜 전체 거래 기록"])
    
    with tab1: show_main_dashboard(portfolio_data)
    with tab2: show_asset_status_tab(portfolio_data)
    with tab3: show_periodic_reports(portfolio_data)
    with tab4: show_portfolio_details(portfolio_data)
    with tab5: show_trade_history(portfolio_data)
    st.markdown("---")
    st.markdown(f'<div style="text-align: center; color: #6B7280; font-size: 12px; padding: 1rem;"><p>🔒 <strong>면책조항:</strong> 본 대시보드는 정보 제공 목적으로만 사용되며, 투자 권유나 조언이 아닙니다.</p><p>📅 마지막 업데이트: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p></div>', unsafe_allow_html=True)

if __name__ == "__main__":
    main()