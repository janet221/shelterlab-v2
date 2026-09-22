# -*- coding: utf-8 -*-
"""
ShelterLab｜六週「留所天數 × 地區」一次分析（W3 品種整併版）
====================================================

使用方式
--------
1. 把這個 Python 檔與 COA_OpenData.csv 放在同一個資料夾。
2. 在該資料夾開啟 PowerShell / 終端機。
3. 第一次執行前安裝：
       pip install pandas openpyxl
4. 執行：
       python shelterlab_regional_stay_analysis.py

程式會一次完成全部分析，不需要選單，並在同一資料夾輸出：

    ShelterLab_六週留所天數與領養率分析_2026-09-05.xlsx

六週主題
--------
W1：毛色 × 留所天數
W2：體型 × 留所天數
W3：標準化品種 × 留所天數（合併同義名稱；排除「其他／未註明」）
W4：性別 × 留所天數
W5：年齡 × 留所天數
W6：毛色 × 體型 × 品種 × 性別 × 年齡 × 留所天數
    ＋現場觀察欄位

地區層級
--------
全台、北部、中部、南部、東部、離島

統計判讀
--------
主要指標：中位數留所天數
輔助指標：平均數、Q1、Q3、IQR、最短、最長、樣本數

領養率
------
只有當 COA_OpenData.csv 真的含有可辨識的「領養日／認養日」欄位時，
才會輸出領養率與已認養相關工作表。

如果沒有領養資料，Excel 會直接略過這些項目，不顯示一堆 0。

若未來資料含真正的領養日欄位，程式會自動嘗試計算：
30 天、90 天、180 天固定追蹤期間領養率。

重要日期規則
------------
分析截止日固定：2026-09-05

入所日：
- 如果資料中存在真正的「入所日期」欄位，優先使用。
- 目前這份政府資料沒有正式入所日期欄位時，
  以 animal_createtime（動物資料建立時間）作為「推定入所日」代理值。

未認養：
    留所天數 = 2026-09-05 - 推定入所日

已認養且有真正領養日：
    留所天數 = 真正領養日 - 推定入所日

animal_opendate：
    是「開放認養時間(起)」，不是入所日。

animal_closeddate：
    是「開放認養時間(迄)」，不是領養日，
    本程式不會用它當領養日。

協尋飼主、暫不開放認養：
    不混入 W1～W6 主分析，另外寫到「協尋暫不開放」工作表。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("缺少 pandas。請先執行：")
    print("pip install pandas openpyxl")
    sys.exit(1)

try:
    from openpyxl import load_workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.formatting.rule import ColorScaleRule
except ImportError:
    print("缺少 openpyxl。請先執行：")
    print("pip install pandas openpyxl")
    sys.exit(1)


# ============================================================
# 1. 基本設定
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "COA_OpenData.csv"

ANALYSIS_DATE = pd.Timestamp("2026-09-05")

OUTPUT_FILENAME = (
    "ShelterLab_六週留所天數地區分析_2026-09-05.xlsx"
)

# 真正入所日欄位：如果未來資料中出現，會優先使用。
TRUE_INTAKE_DATE_CANDIDATES = [
    "animal_intake_date",
    "animal_indate",
    "intake_date",
    "admission_date",
    "入所日期",
    "進所日期",
    "收容日期",
    "實際入所日",
]

# 真正領養日欄位：只有這些類型欄位才會視為領養日。
# animal_closeddate 不在這裡。
TRUE_ADOPTION_DATE_CANDIDATES = [
    "adoption_date",
    "animal_adoptiondate",
    "animal_adoption_date",
    "adopt_date",
    "認養日",
    "領養日",
    "實際認養日",
    "實際領養日",
    "出所認養日",
]

# 可辨識為「已認養」的狀態文字。
ADOPTED_STATUS_KEYWORDS = [
    "ADOPTED",
    "ADOPT",
    "已認養",
    "已領養",
    "認養完成",
    "領養完成",
]

# 協尋原飼主相關文字。
OWNER_SEARCH_KEYWORDS = [
    "協尋飼主",
    "協尋原飼主",
    "公告尋主",
    "尋主",
    "待認領",
    "飼主認領",
    "通知飼主",
    "認領期限",
]

# 明確不開放／尚未開放認養。
NOT_OPEN_KEYWORDS = [
    "暫不開放",
    "尚未開放",
    "不開放認養",
    "不開放領養",
    "待絕育後開放",
    "另擇期開放",
    "若無領回將開放",
    "若無飼主領回",
    "無飼主領回將開放",
    "調查終結前",
]

# 六週欄位
WEEK_CONFIG = {
    "W1_毛色": {
        "label": "毛色",
        "column": "W1_毛色",
    },
    "W2_體型": {
        "label": "體型",
        "column": "W2_體型",
    },
    "W3_品種": {
        "label": "品種",
        "column": "W3_品種",
    },
    "W4_性別": {
        "label": "性別",
        "column": "W4_性別",
    },
    "W5_年齡": {
        "label": "年齡",
        "column": "W5_年齡",
    },
}


# ------------------------------------------------------------
# W3 品種名稱整併規則
# ------------------------------------------------------------
#
# 原則：
# 1. 只合併「明確是同一意涵」的名稱，不把真正不同的亞型硬合併。
# 2. 「其他」、空白、未註明、不明等，不放進 W3 品種比較。
# 3. 被排除的紀錄仍會另外輸出到「W3_未明確品種」，不會消失。
# 4. 原始名稱與標準化名稱會輸出到「W3_品種整併對照」供檢查。

BREED_UNCLEAR_VALUES = {
    "",
    "其他",
    "未註明",
    "未注明",
    "不明",
    "未知",
    "無資料",
    "无资料",
    "未分類",
    "未分类",
    "NONE",
    "NULL",
    "N/A",
    "NA",
}

# 只放「確定是同一品種／同一名稱變體」的整併。
# 不合併：迷你／玩具／標準貴賓、長毛臘腸、長毛吉娃娃、
# 迷你／大型雪納瑞等具有明確亞型資訊的名稱。
BREED_ALIAS_MAP = {
    # 混種
    "混種狗": "混種犬",
    "混種": "混種犬",
    "米克斯": "混種犬",
    "米克斯犬": "混種犬",

    # 常見同義／字形差異
    "台灣犬": "臺灣犬",
    "臺灣犬": "臺灣犬",

    "馬爾濟斯": "瑪爾濟斯犬",
    "馬爾濟斯犬": "瑪爾濟斯犬",
    "瑪爾濟斯": "瑪爾濟斯犬",
    "瑪爾濟斯犬": "瑪爾濟斯犬",

    "拉不拉多犬": "拉布拉多犬",
    "拉布拉多犬": "拉布拉多犬",

    "洛威納犬": "羅威納犬",
    "羅威那犬": "羅威納犬",
    "羅威納犬": "羅威納犬",
    "洛威納犬(羅威那犬)": "羅威納犬",

    "德國狼犬": "德國牧羊犬",
    "德國牧羊犬": "德國牧羊犬",
    "德國狼犬(德國牧羊犬)": "德國牧羊犬",

    "鬥牛犬(英國)": "英國鬥牛犬",
    "英國鬥牛犬": "英國鬥牛犬",

    "哈士奇": "哈士奇（西伯利亞雪橇犬）",
    "西伯利亞雪橇犬": "哈士奇（西伯利亞雪橇犬）",
    "哈士奇(西伯利亞雪橇犬)": "哈士奇（西伯利亞雪橇犬）",

    "吉娃娃": "吉娃娃犬",
    "吉娃娃犬": "吉娃娃犬",

    "臘腸": "臘腸犬",
    "臘腸犬": "臘腸犬",

    "約克夏犬": "約克夏",
    "約克夏": "約克夏",

    # 保留「混種但有已知來源」的資訊，不併入一般混種犬。
    "比特犬之混種犬": "比特犬混種犬",
    "比特犬混種犬": "比特犬混種犬",
}

# 臺灣地區分組
REGION_MAP = {
    # 北部
    "基隆市": "北部",
    "臺北市": "北部",
    "台北市": "北部",
    "新北市": "北部",
    "桃園市": "北部",
    "新竹市": "北部",
    "新竹縣": "北部",
    "宜蘭縣": "北部",

    # 中部
    "苗栗縣": "中部",
    "臺中市": "中部",
    "台中市": "中部",
    "彰化縣": "中部",
    "南投縣": "中部",
    "雲林縣": "中部",

    # 南部
    "嘉義市": "南部",
    "嘉義縣": "南部",
    "臺南市": "南部",
    "台南市": "南部",
    "高雄市": "南部",
    "屏東縣": "南部",

    # 東部
    "花蓮縣": "東部",
    "臺東縣": "東部",
    "台東縣": "東部",

    # 離島
    "澎湖縣": "離島",
    "金門縣": "離島",
    "連江縣": "離島",
}

REGION_ORDER = [
    "全台",
    "北部",
    "中部",
    "南部",
    "東部",
    "離島",
    "未分類",
]


# ============================================================
# 2. 基本工具
# ============================================================

def read_csv_safely(path: Path) -> pd.DataFrame:
    """依序嘗試常見中文 CSV 編碼。"""
    encodings = [
        "utf-8-sig",
        "utf-8",
        "cp950",
        "big5",
    ]

    last_error = None

    for encoding in encodings:
        try:
            return pd.read_csv(
                path,
                encoding=encoding,
                low_memory=False,
                dtype=str,
            )
        except UnicodeDecodeError as error:
            last_error = error

    raise RuntimeError(
        f"無法讀取 CSV 編碼：{last_error}"
    )


def unique_output_path(base_dir: Path, filename: str) -> Path:
    """避免覆蓋舊 Excel，自動加上 _2、_3……"""
    path = base_dir / filename

    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    number = 2

    while True:
        candidate = base_dir / f"{stem}_{number}{suffix}"

        if not candidate.exists():
            return candidate

        number += 1


def text_series(df: pd.DataFrame, column: str) -> pd.Series:
    """安全取得文字欄位。"""
    if column not in df.columns:
        return pd.Series(
            "",
            index=df.index,
            dtype="object",
        )

    return (
        df[column]
        .fillna("")
        .astype(str)
        .str.strip()
    )


def parse_date_series(series: pd.Series) -> pd.Series:
    """日期欄位轉成 datetime。"""
    return pd.to_datetime(
        series,
        errors="coerce",
    ).dt.normalize()


def contains_any(
    series: pd.Series,
    keywords: list[str],
) -> pd.Series:
    """判斷每一列是否包含任一關鍵字。"""
    if not keywords:
        return pd.Series(
            False,
            index=series.index,
        )

    pattern = "|".join(
        re.escape(keyword)
        for keyword in keywords
    )

    return series.str.contains(
        pattern,
        case=False,
        regex=True,
        na=False,
    )


def safe_category(
    series: pd.Series,
    default: str = "未註明",
) -> pd.Series:
    """空白分類統一轉為未註明。"""
    result = (
        series
        .fillna("")
        .astype(str)
        .str.strip()
    )

    return result.mask(
        result.eq(""),
        default,
    )


def detect_first_existing_column(
    df: pd.DataFrame,
    candidates: list[str],
) -> str | None:
    """尋找第一個存在的欄位。"""
    for column in candidates:
        if column in df.columns:
            return column

    return None


# ============================================================
# 3. 地區分類
# ============================================================

def extract_county_from_text(text: str) -> str:
    """
    從地址／收容所名稱中找縣市。
    優先找完整 22 縣市名稱。
    """
    text = str(text or "").strip()

    if not text:
        return "未分類"

    # 依名稱長度由長到短，避免誤判。
    known_counties = sorted(
        REGION_MAP.keys(),
        key=len,
        reverse=True,
    )

    for county in known_counties:
        if county in text:
            # 統一「台」為「臺」
            county = county.replace(
                "台北市",
                "臺北市",
            ).replace(
                "台中市",
                "臺中市",
            ).replace(
                "台南市",
                "臺南市",
            ).replace(
                "台東縣",
                "臺東縣",
            )
            return county

    return "未分類"


def add_region_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    先用 shelter_address 判斷，
    找不到再用 shelter_name / animal_place。
    """
    result = df.copy()

    address = text_series(
        result,
        "shelter_address",
    )

    shelter_name = text_series(
        result,
        "shelter_name",
    )

    animal_place = text_series(
        result,
        "animal_place",
    )

    combined = (
        address
        + " "
        + shelter_name
        + " "
        + animal_place
    )

    result["縣市"] = combined.map(
        extract_county_from_text
    )

    result["地區"] = result["縣市"].map(
        REGION_MAP
    ).fillna("未分類")

    return result


# ============================================================
# 4. 六週分類欄位整理
# ============================================================

def normalize_breed_name(value: str) -> tuple[str, bool, str]:
    """
    W3 品種名稱標準化。

    回傳：
    - 標準化品種名稱
    - 是否納入 W3 品種統計
    - 整併／排除說明
    """
    raw = "" if pd.isna(value) else str(value).strip()

    # 統一一般空白字元
    raw = re.sub(r"\s+", " ", raw).strip()

    if raw.upper() in {v.upper() for v in BREED_UNCLEAR_VALUES}:
        display = raw if raw else "空白"
        return "未明確標記", False, f"排除：原始品種為「{display}」"

    normalized = BREED_ALIAS_MAP.get(raw, raw)

    if normalized != raw:
        return normalized, True, f"整併：{raw} → {normalized}"

    return normalized, True, "保留原標記"


def add_breed_normalization_columns(result: pd.DataFrame) -> pd.DataFrame:
    """
    保留原始品種欄位，再建立：
    - W3_品種：標準化後名稱
    - W3_品種是否納入：True/False
    - W3_品種處理：整併／排除原因
    """
    result = result.copy()

    raw_series = text_series(
        result,
        "animal_Variety",
    )

    result["W3_原始品種"] = raw_series

    normalized = raw_series.map(
        normalize_breed_name
    )

    result["W3_品種"] = normalized.map(
        lambda item: item[0]
    )

    result["W3_品種是否納入"] = normalized.map(
        lambda item: bool(item[1])
    )

    result["W3_品種處理"] = normalized.map(
        lambda item: item[2]
    )

    return result


def normalize_week_fields(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()

    # W1 毛色
    result["W1_毛色"] = safe_category(
        text_series(
            result,
            "animal_colour",
        )
    )

    # W2 體型
    body_raw = safe_category(
        text_series(
            result,
            "animal_bodytype",
        )
    )

    body_map = {
        "SMALL": "小型",
        "MEDIUM": "中型",
        "BIG": "大型",
        "LARGE": "大型",
    }

    result["W2_體型"] = body_raw.map(
        lambda value: body_map.get(
            value.upper(),
            value,
        )
    )

    # W3 品種
    # 不直接使用原始 animal_Variety。
    # 先整併同義名稱，再將「其他／未註明／空白」標記為不納入 W3。
    result = add_breed_normalization_columns(
        result
    )

    # W4 性別
    sex_raw = safe_category(
        text_series(
            result,
            "animal_sex",
        )
    )

    sex_map = {
        "M": "公",
        "F": "母",
        "N": "未註明",
    }

    result["W4_性別"] = sex_raw.map(
        lambda value: sex_map.get(
            value.upper(),
            value,
        )
    )

    # W5 年齡
    age_raw = safe_category(
        text_series(
            result,
            "animal_age",
        )
    )

    age_map = {
        "CHILD": "幼年",
        "ADULT": "成年",
    }

    result["W5_年齡"] = age_raw.map(
        lambda value: age_map.get(
            value.upper(),
            value,
        )
    )

    return result


# ============================================================
# 5. 入所日、領養日、排除資料
# ============================================================

def prepare_dog_data(df: pd.DataFrame):
    """
    回傳：
    - 全部犬隻
    - 主分析資料
    - 各排除／分流資料
    - 日期欄位來源
    """

    # --------------------------------------------------------
    # 只保留犬隻
    # --------------------------------------------------------

    animal_kind = text_series(
        df,
        "animal_kind",
    )

    dog_mask = animal_kind.str.contains(
        r"犬|狗",
        regex=True,
        na=False,
    )

    dogs = df.loc[dog_mask].copy()

    dogs = add_region_columns(dogs)
    dogs = normalize_week_fields(dogs)

    # --------------------------------------------------------
    # 入所日
    # --------------------------------------------------------

    true_intake_column = detect_first_existing_column(
        dogs,
        TRUE_INTAKE_DATE_CANDIDATES,
    )

    if true_intake_column:
        intake_source = (
            f"{true_intake_column}（資料中的正式入所日期欄位）"
        )

        dogs["推定入所日"] = parse_date_series(
            dogs[true_intake_column]
        )

        dogs["入所日是否代理值"] = "否"

    else:
        if "animal_createtime" not in dogs.columns:
            raise KeyError(
                "資料沒有正式入所日期，也找不到 animal_createtime。"
            )

        intake_source = (
            "animal_createtime（動物資料建立時間；作為推定入所日代理值）"
        )

        dogs["推定入所日"] = parse_date_series(
            dogs["animal_createtime"]
        )

        dogs["入所日是否代理值"] = "是"

    # --------------------------------------------------------
    # 真正領養日
    # --------------------------------------------------------

    true_adoption_column = detect_first_existing_column(
        dogs,
        TRUE_ADOPTION_DATE_CANDIDATES,
    )

    if true_adoption_column:
        dogs["真正領養日"] = parse_date_series(
            dogs[true_adoption_column]
        )
    else:
        dogs["真正領養日"] = pd.NaT

    # --------------------------------------------------------
    # 開放認養日
    # --------------------------------------------------------

    if "animal_opendate" in dogs.columns:
        dogs["開放認養日"] = parse_date_series(
            dogs["animal_opendate"]
        )
    else:
        dogs["開放認養日"] = pd.NaT

    # --------------------------------------------------------
    # 文字狀態
    # --------------------------------------------------------

    combined_text = (
        text_series(
            dogs,
            "animal_title",
        )
        + " "
        + text_series(
            dogs,
            "animal_remark",
        )
        + " "
        + text_series(
            dogs,
            "animal_caption",
        )
    )

    status_text = text_series(
        dogs,
        "animal_status",
    )

    dogs["_combined_text"] = combined_text
    dogs["_status_text"] = status_text

    owner_search = contains_any(
        combined_text,
        OWNER_SEARCH_KEYWORDS,
    )

    explicit_not_open = contains_any(
        combined_text,
        NOT_OPEN_KEYWORDS,
    )

    status_adopted = (
        contains_any(
            status_text,
            ADOPTED_STATUS_KEYWORDS,
        )
        |
        contains_any(
            combined_text,
            ADOPTED_STATUS_KEYWORDS,
        )
    )

    future_open = (
        dogs["開放認養日"].notna()
        &
        (
            dogs["開放認養日"]
            > ANALYSIS_DATE
        )
    )

    owner_search_not_open = (
        owner_search
        &
        (
            explicit_not_open
            |
            future_open
            |
            dogs["開放認養日"].isna()
        )
    )

    # --------------------------------------------------------
    # 日期異常
    # --------------------------------------------------------

    invalid_intake = (
        dogs["推定入所日"].isna()
        |
        (
            dogs["推定入所日"]
            > ANALYSIS_DATE
        )
    )

    adoption_after_cutoff = (
        dogs["真正領養日"].notna()
        &
        (
            dogs["真正領養日"]
            > ANALYSIS_DATE
        )
    )

    adoption_before_intake = (
        dogs["真正領養日"].notna()
        &
        dogs["推定入所日"].notna()
        &
        (
            dogs["真正領養日"]
            < dogs["推定入所日"]
        )
    )

    # --------------------------------------------------------
    # 分流：優先順序很重要
    # --------------------------------------------------------

    remaining = pd.Series(
        True,
        index=dogs.index,
    )

    groups = {}

    groups["資料異常"] = dogs.loc[
        remaining
        &
        (
            invalid_intake
            |
            adoption_after_cutoff
            |
            adoption_before_intake
        )
    ].copy()

    remaining &= ~(
        invalid_intake
        |
        adoption_after_cutoff
        |
        adoption_before_intake
    )

    # 協尋原飼主且仍不開放認養
    groups["協尋暫不開放"] = dogs.loc[
        remaining
        &
        owner_search_not_open
    ].copy()

    remaining &= ~owner_search_not_open

    # 非協尋，但開放認養日在分析截止日之後
    groups["尚未開放"] = dogs.loc[
        remaining
        &
        future_open
    ].copy()

    remaining &= ~future_open

    # 真正有領養日期
    adopted_with_date = (
        dogs["真正領養日"].notna()
    )

    groups["已認養"] = dogs.loc[
        remaining
        &
        adopted_with_date
    ].copy()

    remaining &= ~adopted_with_date

    # 狀態說已認養，但沒有真正領養日：不猜日期
    adopted_without_date = (
        status_adopted
        &
        dogs["真正領養日"].isna()
    )

    groups["已認養缺日期"] = dogs.loc[
        remaining
        &
        adopted_without_date
    ].copy()

    remaining &= ~adopted_without_date

    # 剩下視為截至 2026/9/5 仍在主要分析中的未認養犬隻
    groups["未認養_主要"] = dogs.loc[
        remaining
    ].copy()

    # --------------------------------------------------------
    # 留所天數
    # --------------------------------------------------------

    if not groups["已認養"].empty:
        groups["已認養"]["計算終點"] = (
            groups["已認養"]["真正領養日"]
        )

        groups["已認養"]["留所天數"] = (
            groups["已認養"]["計算終點"]
            -
            groups["已認養"]["推定入所日"]
        ).dt.days

        groups["已認養"]["分析狀態"] = (
            "已認養（有真正領養日）"
        )

    if not groups["未認養_主要"].empty:
        groups["未認養_主要"]["計算終點"] = (
            ANALYSIS_DATE
        )

        groups["未認養_主要"]["留所天數"] = (
            groups["未認養_主要"]["計算終點"]
            -
            groups["未認養_主要"]["推定入所日"]
        ).dt.days

        groups["未認養_主要"]["分析狀態"] = (
            "截至 2026-09-05 未認養"
        )

    main_analysis = pd.concat(
        [
            groups["未認養_主要"],
            groups["已認養"],
        ],
        ignore_index=True,
        sort=False,
    )

    # 移除負數（理論上前面已擋）
    if not main_analysis.empty:
        main_analysis = main_analysis.loc[
            main_analysis["留所天數"].notna()
            &
            (
                main_analysis["留所天數"]
                >= 0
            )
        ].copy()

    return {
        "dogs": dogs,
        "main": main_analysis,
        "groups": groups,
        "intake_source": intake_source,
        "true_intake_column": true_intake_column,
        "true_adoption_column": true_adoption_column,
    }


# ============================================================
# 6. 留所天數統計
# ============================================================

def sample_size_note(n: int) -> str:
    """
    只是提醒樣本量，不代表統計顯著性。
    """
    if n < 10:
        return "樣本很少，勿過度解讀"
    if n < 30:
        return "樣本偏少，解讀需保守"
    return "可做描述性比較"


def add_all_taiwan_rows(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    將每筆資料再複製一份標記為「全台」，
    讓同一個 groupby 同時計算全台與各地區。
    """
    if df.empty:
        return df.copy()

    regional = df.copy()

    national = df.copy()
    national["統計地區"] = "全台"

    regional["統計地區"] = (
        regional["地區"]
    )

    return pd.concat(
        [
            national,
            regional,
        ],
        ignore_index=True,
        sort=False,
    )


def grouped_stay_summary(
    df: pd.DataFrame,
    group_columns: list[str],
) -> pd.DataFrame:
    """
    中位數為主要指標。
    """
    columns = (
        group_columns
        + [
            "犬隻筆數",
            "中位數留所天數",
            "Q1_25%",
            "Q3_75%",
            "IQR",
            "平均留所天數",
            "平均減中位數",
            "最短留所天數",
            "最長留所天數",
            "180天以上筆數",
            "180天以上比例",
            "365天以上筆數",
            "365天以上比例",
            "樣本量提示",
        ]
    )

    if df.empty:
        return pd.DataFrame(
            columns=columns
        )

    working = df.loc[
        df["留所天數"].notna()
    ].copy()

    if working.empty:
        return pd.DataFrame(
            columns=columns
        )

    rows = []

    grouped = working.groupby(
        group_columns,
        dropna=False,
        sort=False,
    )

    for keys, group in grouped:
        if not isinstance(keys, tuple):
            keys = (keys,)

        stay = (
            group["留所天數"]
            .astype(float)
        )

        n = len(stay)

        median = float(
            stay.median()
        )

        mean = float(
            stay.mean()
        )

        q1 = float(
            stay.quantile(0.25)
        )

        q3 = float(
            stay.quantile(0.75)
        )

        long_180 = int(
            (stay >= 180).sum()
        )

        long_365 = int(
            (stay >= 365).sum()
        )

        row = {
            column: value
            for column, value
            in zip(
                group_columns,
                keys,
            )
        }

        row.update(
            {
                "犬隻筆數": n,
                "中位數留所天數": round(
                    median,
                    1,
                ),
                "Q1_25%": round(
                    q1,
                    1,
                ),
                "Q3_75%": round(
                    q3,
                    1,
                ),
                "IQR": round(
                    q3 - q1,
                    1,
                ),
                "平均留所天數": round(
                    mean,
                    1,
                ),
                "平均減中位數": round(
                    mean - median,
                    1,
                ),
                "最短留所天數": int(
                    stay.min()
                ),
                "最長留所天數": int(
                    stay.max()
                ),
                "180天以上筆數": long_180,
                "180天以上比例": round(
                    long_180 / n,
                    4,
                ),
                "365天以上筆數": long_365,
                "365天以上比例": round(
                    long_365 / n,
                    4,
                ),
                "樣本量提示": sample_size_note(
                    n
                ),
            }
        )

        rows.append(row)

    result = pd.DataFrame(rows)

    if "統計地區" in result.columns:
        order_map = {
            name: index
            for index, name
            in enumerate(REGION_ORDER)
        }

        result["_地區排序"] = (
            result["統計地區"]
            .map(order_map)
            .fillna(999)
        )

        result = (
            result
            .sort_values(
                [
                    "_地區排序",
                    "犬隻筆數",
                    "中位數留所天數",
                ],
                ascending=[
                    True,
                    False,
                    False,
                ],
            )
            .drop(
                columns=["_地區排序"]
            )
            .reset_index(
                drop=True
            )
        )

    return result


def build_week_tables(
    main_df: pd.DataFrame,
) -> dict[str, pd.DataFrame]:
    """
    W1～W5：每週同時包含全台、北中南東離島。

    W3 特別規則：
    - 先整併同義品種名稱。
    - 「其他／未註明／空白／不明」不納入品種統計。
    - 排除的紀錄仍會在另外工作表明列。
    """
    tables = {}

    for sheet_name, config in WEEK_CONFIG.items():
        label = config["label"]
        column = config["column"]

        week_df = main_df.copy()

        if sheet_name == "W3_品種":
            week_df = week_df.loc[
                week_df["W3_品種是否納入"].fillna(False)
            ].copy()

        expanded = add_all_taiwan_rows(
            week_df
        )

        table = grouped_stay_summary(
            expanded,
            [
                "統計地區",
                column,
            ],
        )

        table = table.rename(
            columns={
                column: label
            }
        )

        tables[sheet_name] = table

    return tables


def build_region_overview(
    main_df: pd.DataFrame,
) -> pd.DataFrame:
    expanded = add_all_taiwan_rows(
        main_df
    )

    summary = grouped_stay_summary(
        expanded,
        ["統計地區"],
    )

    # 增加收容所數量
    shelter_counts = []

    for region in REGION_ORDER:
        if region == "全台":
            part = main_df
        else:
            part = main_df.loc[
                main_df["地區"] == region
            ]

        shelters = (
            part["shelter_name"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        shelters = shelters[
            shelters != ""
        ]

        shelter_counts.append(
            {
                "統計地區": region,
                "收容所數量": shelters.nunique(),
            }
        )

    shelter_df = pd.DataFrame(
        shelter_counts
    )

    return summary.merge(
        shelter_df,
        on="統計地區",
        how="left",
    )


def build_w6_integrated(
    main_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    W6：五項條件交叉。

    因為 W6 使用 W3 品種欄位，
    「其他／未註明／空白／不明」同樣不納入整合品種比較，
    避免不明確品種成為干擾類別。
    """
    working = main_df.loc[
        main_df["W3_品種是否納入"].fillna(False)
    ].copy()

    expanded = add_all_taiwan_rows(
        working
    )

    return grouped_stay_summary(
        expanded,
        [
            "統計地區",
            "W1_毛色",
            "W2_體型",
            "W3_品種",
            "W4_性別",
            "W5_年齡",
        ],
    )


def build_w3_breed_mapping(
    main_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    原始品種名稱 → 標準化品種名稱的透明對照表。
    """
    if main_df.empty:
        return pd.DataFrame(
            columns=[
                "原始品種",
                "標準化品種",
                "是否納入W3",
                "處理方式",
                "犬隻筆數",
            ]
        )

    working = main_df.copy()

    working["原始品種_顯示"] = (
        working["W3_原始品種"]
        .fillna("")
        .astype(str)
        .str.strip()
        .replace("", "空白")
    )

    result = (
        working
        .groupby(
            [
                "原始品種_顯示",
                "W3_品種",
                "W3_品種是否納入",
                "W3_品種處理",
            ],
            dropna=False,
        )
        .size()
        .reset_index(
            name="犬隻筆數"
        )
        .rename(
            columns={
                "原始品種_顯示": "原始品種",
                "W3_品種": "標準化品種",
                "W3_品種是否納入": "是否納入W3",
                "W3_品種處理": "處理方式",
            }
        )
    )

    result["是否納入W3"] = result[
        "是否納入W3"
    ].map(
        {
            True: "是",
            False: "否",
        }
    )

    return (
        result
        .sort_values(
            [
                "是否納入W3",
                "犬隻筆數",
                "標準化品種",
            ],
            ascending=[
                True,
                False,
                True,
            ],
        )
        .reset_index(
            drop=True
        )
    )


def build_w3_unclear_detail(
    main_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    W3 中未明確標記品種的紀錄。
    不納入品種比較，但保留透明明細。
    """
    unclear = main_df.loc[
        ~main_df["W3_品種是否納入"].fillna(False)
    ].copy()

    if unclear.empty:
        return pd.DataFrame(
            columns=[
                "animal_id",
                "縣市",
                "地區",
                "原始品種",
                "排除原因",
                "留所天數",
                "shelter_name",
            ]
        )

    unclear["原始品種"] = (
        unclear["W3_原始品種"]
        .fillna("")
        .astype(str)
        .str.strip()
        .replace("", "空白")
    )

    unclear["排除原因"] = unclear[
        "W3_品種處理"
    ]

    columns = [
        "animal_id",
        "縣市",
        "地區",
        "原始品種",
        "排除原因",
        "留所天數",
        "shelter_name",
        "shelter_address",
    ]

    columns = [
        col
        for col in columns
        if col in unclear.columns
    ]

    return (
        unclear[columns]
        .sort_values(
            [
                "地區",
                "原始品種",
            ]
        )
        .reset_index(
            drop=True
        )
    )


# ============================================================
# 7. 領養率模式
# ============================================================

def build_adoption_rate_mode(
    prepared: dict,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    回傳：
    1. 領養率模式說明
    2. 若可計算，回傳 30/90/180 天領養率資料；否則空表

    固定期間領養率：
    - 分母：能完整觀察該期間的犬隻，或已在該期間內被領養的犬隻
    - 分子：該期間內被領養的犬隻
    """

    dogs = prepared["dogs"]
    main_df = prepared["main"]
    adoption_column = prepared[
        "true_adoption_column"
    ]

    status_values = (
        text_series(
            dogs,
            "animal_status",
        )
        .replace(
            "",
            pd.NA,
        )
        .dropna()
        .unique()
        .tolist()
    )

    has_real_adoption_dates = (
        adoption_column is not None
        and
        dogs["真正領養日"].notna().any()
    )

    if not has_real_adoption_dates:
        notes = pd.DataFrame(
            [
                [
                    "目前能否正式計算領養率",
                    "否",
                ],
                [
                    "原因",
                    (
                        "目前資料沒有真正的領養日／認養日歷史欄位；"
                        "不能把 animal_closeddate 當作領養日。"
                    ),
                ],
                [
                    "目前 animal_status",
                    "、".join(
                        map(
                            str,
                            status_values,
                        )
                    )
                    if status_values
                    else "無",
                ],
                [
                    "為什麼不能把缺少紀錄視為已領養",
                    (
                        "犬隻離開公開清單可能有認養、飼主領回、轉所、死亡或其他結案原因，"
                        "不能直接等同認養。"
                    ),
                ],
                [
                    "未來建議指標",
                    "30 天、90 天、180 天領養率",
                ],
                [
                    "未來所需欄位",
                    (
                        "真正入所日期、真正領養日期／離所日期、離所原因或完整歷史結局"
                    ),
                ],
                [
                    "統計提醒",
                    (
                        "單一總領養率會受每隻犬追蹤時間不同影響；"
                        "固定 30/90/180 天比較會比單一粗略比例更合理。"
                    ),
                ],
            ],
            columns=[
                "項目",
                "說明",
            ],
        )

        return (
            notes,
            pd.DataFrame(),
        )

    # --------------------------------------------------------
    # 若未來資料有真正領養日，自動啟用
    # --------------------------------------------------------

    notes = pd.DataFrame(
        [
            [
                "目前能否正式計算領養率",
                "可嘗試計算",
            ],
            [
                "真正領養日欄位",
                adoption_column,
            ],
            [
                "計算方式",
                (
                    "固定追蹤 30/90/180 天；"
                    "只把已完整追蹤到該天數或已在期限內領養的犬隻列入分母。"
                ),
            ],
            [
                "統計限制",
                (
                    "仍須確認資料是否保留所有非認養結局；"
                    "若歷史資料不完整，領養率仍可能偏誤。"
                ),
            ],
        ],
        columns=[
            "項目",
            "說明",
        ],
    )

    analysis = main_df.copy()

    analysis = analysis.loc[
        analysis["推定入所日"].notna()
    ].copy()

    expanded = add_all_taiwan_rows(
        analysis
    )

    result_rows = []

    horizons = [
        30,
        90,
        180,
    ]

    for week_name, config in WEEK_CONFIG.items():
        category_column = config["column"]
        category_label = config["label"]

        group_columns = [
            "統計地區",
            category_column,
        ]

        for keys, group in expanded.groupby(
            group_columns,
            dropna=False,
            sort=False,
        ):
            region, category = keys

            for horizon in horizons:
                deadline = (
                    group["推定入所日"]
                    +
                    pd.to_timedelta(
                        horizon,
                        unit="D",
                    )
                )

                adopted_within = (
                    group["真正領養日"].notna()
                    &
                    (
                        group["真正領養日"]
                        <= deadline
                    )
                )

                has_full_followup = (
                    group["推定入所日"]
                    <= (
                        ANALYSIS_DATE
                        -
                        pd.Timedelta(
                            days=horizon
                        )
                    )
                )

                eligible = (
                    adopted_within
                    |
                    has_full_followup
                )

                denominator = int(
                    eligible.sum()
                )

                numerator = int(
                    (
                        adopted_within
                        &
                        eligible
                    ).sum()
                )

                rate = (
                    numerator / denominator
                    if denominator > 0
                    else None
                )

                result_rows.append(
                    {
                        "週次": week_name,
                        "統計地區": region,
                        "分類欄位": category_label,
                        "分類": category,
                        "追蹤天數": horizon,
                        "可比較犬隻數": denominator,
                        "期限內認養數": numerator,
                        "領養率": (
                            round(
                                rate,
                                4,
                            )
                            if rate is not None
                            else None
                        ),
                        "樣本量提示": (
                            sample_size_note(
                                denominator
                            )
                            if denominator > 0
                            else "無可比較樣本"
                        ),
                    }
                )

    adoption_table = pd.DataFrame(
        result_rows
    )

    return (
        notes,
        adoption_table,
    )


# ============================================================
# 8. Excel 輸出內容
# ============================================================

def detail_columns(
    df: pd.DataFrame,
) -> list[str]:
    preferred = [
        "animal_id",
        "animal_subid",
        "animal_kind",
        "縣市",
        "地區",
        "W1_毛色",
        "W2_體型",
        "W3_原始品種",
        "W3_品種",
        "W3_品種是否納入",
        "W3_品種處理",
        "W4_性別",
        "W5_年齡",
        "推定入所日",
        "入所日是否代理值",
        "開放認養日",
        "真正領養日",
        "計算終點",
        "留所天數",
        "分析狀態",
        "animal_status",
        "animal_remark",
        "animal_caption",
        "animal_foundplace",
        "shelter_name",
        "shelter_address",
        "animal_createtime",
        "animal_opendate",
        "animal_closeddate",
        "animal_update",
        "cDate",
    ]

    return [
        column
        for column in preferred
        if column in df.columns
    ]


def build_analysis_notes(
    prepared: dict,
) -> pd.DataFrame:
    adoption_column = prepared[
        "true_adoption_column"
    ]

    rows = [
        [
            "研究主軸",
            "比較犬隻不同特徵與留所天數的關係，並分全台、北部、中部、南部、東部、離島觀察。",
        ],
        [
            "主要統計指標",
            "中位數留所天數。中位數較不容易被少數超長留所紀錄拉高。",
        ],
        [
            "輔助統計指標",
            "平均數、Q1、Q3、IQR、最短、最長、樣本數，以及 180／365 天以上比例。",
        ],
        [
            "平均數與中位數",
            "兩者都保留；若平均數明顯高於中位數，可能表示少數長期留所紀錄把平均數往上拉。",
        ],
        [
            "W3 品種整併",
            (
                "W3 不直接照抄原始品種文字。明確同義名稱會先整併，例如「混種狗」併入「混種犬」；"
                "「其他、未註明、空白、不明」不納入品種比較，另放到「W3_未明確品種」。"
            ),
        ],
        [
            "W3 保留亞型",
            (
                "只有明確同義名稱才整併；迷你／玩具／標準貴賓、長毛臘腸、長毛吉娃娃、"
                "迷你／大型雪納瑞等帶有亞型資訊的標記不會被硬合併。"
            ),
        ],
        [
            "分析截止日",
            "2026-09-05",
        ],
        [
            "入所日來源",
            prepared["intake_source"],
        ],
        [
            "未認養留所天數",
            "2026-09-05 - 推定入所日",
        ],
        [
            "animal_opendate",
            "開放認養時間(起)，不是入所日期。",
        ],
        [
            "animal_closeddate",
            "開放認養時間(迄)，不是領養日期，不拿來計算領養日。",
        ],
        [
            "協尋暫不開放",
            "協尋原飼主且尚未開放認養的紀錄不混入 W1～W6，另表保存。",
        ],
        [
            "尚未開放",
            "開放認養日期在 2026-09-05 之後者不混入 W1～W6，另表保存。",
        ],
        [
            "地區分類",
            "北部、中部、南部、東部、離島；每週另加入全台作比較。Excel 以不同淡色區分地區。",
        ],
        [
            "因果限制",
            (
                "本分析只能描述群體資料差異。即使某毛色／體型／品種／性別／年齡中位數較高，"
                "也不能單靠這份資料證明該特徵造成留所較久。"
            ),
        ],
        [
            "地區差異限制",
            (
                "不同地區的收容資源、犬隻來源、收容量、人口與認養環境都可能不同，"
                "不應把地區差異直接解讀成犬隻特徵的效果。"
            ),
        ],
    ]

    # 只有真的存在領養日期欄位時，才顯示領養相關說明。
    if adoption_column:
        rows.insert(7, [
            "已認養留所天數",
            "真正領養日 - 推定入所日。",
        ])
        rows.insert(8, [
            "真正領養日欄位",
            adoption_column,
        ])

    return pd.DataFrame(
        rows,
        columns=[
            "項目",
            "說明",
        ],
    )


def build_region_mapping_sheet() -> pd.DataFrame:
    rows = []

    for county, region in REGION_MAP.items():
        # 避免「台」與「臺」重複列兩次
        canonical = county.replace(
            "台北市",
            "臺北市",
        ).replace(
            "台中市",
            "臺中市",
        ).replace(
            "台南市",
            "臺南市",
        ).replace(
            "台東縣",
            "臺東縣",
        )

        rows.append(
            {
                "縣市": canonical,
                "地區": region,
            }
        )

    return (
        pd.DataFrame(rows)
        .drop_duplicates()
        .sort_values(
            [
                "地區",
                "縣市",
            ]
        )
        .reset_index(
            drop=True
        )
    )


def build_w6_field_observation_template() -> pd.DataFrame:
    return pd.DataFrame(
        columns=[
            "animal_id",
            "收容所",
            "地區",
            "參訪日期",
            "公開資料毛色",
            "現場觀察毛色",
            "公開資料體型",
            "現場觀察體型",
            "公開資料品種",
            "現場說明品種／分類依據",
            "公開資料性別",
            "現場確認性別",
            "公開資料年齡",
            "現場年齡資訊",
            "公開資料推定入所日",
            "現場確認實際入所日",
            "公開資料留所天數",
            "現場核對結果",
            "客觀觀察",
            "自己的推測",
            "工作人員／專業說明",
            "還需要確認的資料",
        ]
    )


# ============================================================
# 9. Excel 樣式
# ============================================================

def style_excel(
    output_path: Path,
):
    wb = load_workbook(
        output_path
    )

    dark_blue = "1F4E78"
    light_blue = "D9EAF7"
    light_gray = "F2F2F2"
    white = "FFFFFF"

    # 地區配色：刻意使用淡色，避免壓過統計數字。
    region_row_colors = {
        "全台": "EAF2F8",   # 淡藍灰
        "北部": "E8F1FB",   # 淡藍
        "中部": "EAF4E2",   # 淡綠
        "南部": "FCEBDD",   # 淡橘
        "東部": "F1EAF7",   # 淡紫
        "離島": "FFF6D8",   # 淡黃
        "未分類": "EEEEEE", # 淡灰
    }

    region_label_colors = {
        "全台": "9DC3E6",
        "北部": "9CC2E5",
        "中部": "A9D18E",
        "南部": "F4B183",
        "東部": "C5B0D5",
        "離島": "FFD966",
        "未分類": "BFBFBF",
    }

    thin = Side(
        style="thin",
        color="D9E1F2",
    )

    medium = Side(
        style="medium",
        color="7F8C8D",
    )

    border = Border(
        left=thin,
        right=thin,
        top=thin,
        bottom=thin,
    )

    for ws in wb.worksheets:
        # 寬表格把地區／分類欄一起固定，更容易橫向閱讀。
        if ws.title in WEEK_CONFIG:
            ws.freeze_panes = "C2"
        elif ws.title == "W3_品種整併對照":
            ws.freeze_panes = "A2"
        elif ws.title == "W3_未明確品種":
            ws.freeze_panes = "D2"
        elif ws.title == "W6_整合":
            ws.freeze_panes = "G2"
        elif ws.title == "地區總覽":
            ws.freeze_panes = "B2"
        else:
            ws.freeze_panes = "A2"

        # 標題列
        for cell in ws[1]:
            cell.fill = PatternFill(
                "solid",
                fgColor=dark_blue,
            )

            cell.font = Font(
                color=white,
                bold=True,
            )

            cell.alignment = Alignment(
                horizontal="center",
                vertical="center",
                wrap_text=True,
            )

            cell.border = border

        # 內容
        for row in ws.iter_rows(
            min_row=2
        ):
            for cell in row:
                cell.alignment = Alignment(
                    vertical="top",
                    wrap_text=True,
                )

                cell.border = border

        # AutoFilter
        if (
            ws.max_row >= 1
            and
            ws.max_column >= 1
        ):
            ws.auto_filter.ref = (
                ws.dimensions
            )

        # 合理欄寬
        for column_cells in ws.columns:
            letter = (
                column_cells[0]
                .column_letter
            )

            max_length = 0

            for cell in column_cells[
                : min(
                    len(column_cells),
                    250,
                )
            ]:
                if cell.value is None:
                    continue

                max_length = max(
                    max_length,
                    len(
                        str(
                            cell.value
                        )
                    ),
                )

            ws.column_dimensions[
                letter
            ].width = min(
                max(
                    max_length + 2,
                    10,
                ),
                40,
            )

        # 日期格式
        header_lookup = {
            cell.value: cell.column
            for cell in ws[1]
        }

        for header in [
            "推定入所日",
            "開放認養日",
            "真正領養日",
            "計算終點",
            "參訪日期",
            "現場確認實際入所日",
        ]:
            if header in header_lookup:
                col_idx = (
                    header_lookup[
                        header
                    ]
                )

                for row_idx in range(
                    2,
                    ws.max_row + 1,
                ):
                    ws.cell(
                        row=row_idx,
                        column=col_idx,
                    ).number_format = (
                        "yyyy-mm-dd"
                    )

        # 比例格式
        for header in [
            "180天以上比例",
            "365天以上比例",
            "領養率",
        ]:
            if header in header_lookup:
                col_idx = (
                    header_lookup[
                        header
                    ]
                )

                for row_idx in range(
                    2,
                    ws.max_row + 1,
                ):
                    ws.cell(
                        row=row_idx,
                        column=col_idx,
                    ).number_format = (
                        "0.0%"
                    )

        # ----------------------------------------------------
        # 地區視覺分組
        # ----------------------------------------------------
        if "統計地區" in header_lookup:
            region_col = header_lookup[
                "統計地區"
            ]

            previous_region = None

            for row_idx in range(
                2,
                ws.max_row + 1,
            ):
                region = ws.cell(
                    row=row_idx,
                    column=region_col,
                ).value

                if region is None:
                    continue

                region = str(region)

                pale_color = region_row_colors.get(
                    region,
                    "FFFFFF",
                )

                label_color = region_label_colors.get(
                    region,
                    "D9D9D9",
                )

                # 整列淡色，讓不同地區一眼就能分群。
                for cell in ws[row_idx]:
                    cell.fill = PatternFill(
                        "solid",
                        fgColor=pale_color,
                    )

                # 地區欄再加深、加粗。
                region_cell = ws.cell(
                    row=row_idx,
                    column=region_col,
                )

                region_cell.fill = PatternFill(
                    "solid",
                    fgColor=label_color,
                )

                region_cell.font = Font(
                    bold=True,
                )

                region_cell.alignment = Alignment(
                    horizontal="center",
                    vertical="center",
                    wrap_text=True,
                )

                # 進入新地區時，加一條明顯的上框線，形成區塊分隔。
                if region != previous_region:
                    for cell in ws[row_idx]:
                        cell.border = Border(
                            left=thin,
                            right=thin,
                            top=medium,
                            bottom=thin,
                        )

                previous_region = region

        # 地區對照表也使用同一套顏色。
        if (
            ws.title == "地區對照"
            and
            "地區" in header_lookup
        ):
            region_col = header_lookup[
                "地區"
            ]

            for row_idx in range(
                2,
                ws.max_row + 1,
            ):
                region = ws.cell(
                    row=row_idx,
                    column=region_col,
                ).value

                color = region_row_colors.get(
                    str(region),
                    "FFFFFF",
                )

                for cell in ws[row_idx]:
                    cell.fill = PatternFill(
                        "solid",
                        fgColor=color,
                    )

        # 中位數色階（主指標）
        # 地區底色仍保留，中位數欄用色階突出高低。
        if (
            "中位數留所天數"
            in header_lookup
            and
            ws.max_row >= 2
        ):
            col_letter = ws.cell(
                row=1,
                column=header_lookup[
                    "中位數留所天數"
                ],
            ).column_letter

            ws.conditional_formatting.add(
                (
                    f"{col_letter}2:"
                    f"{col_letter}{ws.max_row}"
                ),
                ColorScaleRule(
                    start_type="min",
                    start_color="E2F0D9",
                    mid_type="percentile",
                    mid_value=50,
                    mid_color="FFF2CC",
                    end_type="max",
                    end_color="F4CCCC",
                ),
            )

    # 說明類工作表第一欄加強
    for sheet_name in [
        "分析說明",
        "領養率模式",
    ]:
        if sheet_name not in wb.sheetnames:
            continue

        ws = wb[sheet_name]

        for row_idx in range(
            2,
            ws.max_row + 1,
        ):
            cell = ws.cell(
                row=row_idx,
                column=1,
            )

            cell.font = Font(
                bold=True
            )

            cell.fill = PatternFill(
                "solid",
                fgColor=light_blue,
            )

    wb.save(
        output_path
    )


# ============================================================
# 10. 寫入 Excel
# ============================================================

def export_excel(
    prepared: dict,
    output_path: Path,
):
    main_df = prepared["main"]
    groups = prepared["groups"]

    week_tables = build_week_tables(
        main_df
    )

    w3_breed_mapping = build_w3_breed_mapping(
        main_df
    )

    w3_unclear_detail = build_w3_unclear_detail(
        main_df
    )

    region_overview = (
        build_region_overview(
            main_df
        )
    )

    w6_integrated = (
        build_w6_integrated(
            main_df
        )
    )

    has_adoption_data = bool(
        prepared["true_adoption_column"]
        and
        prepared["dogs"]["真正領養日"].notna().any()
    )

    if has_adoption_data:
        adoption_notes, adoption_table = (
            build_adoption_rate_mode(
                prepared
            )
        )
    else:
        adoption_notes = None
        adoption_table = pd.DataFrame()

    analysis_notes = (
        build_analysis_notes(
            prepared
        )
    )

    region_mapping = (
        build_region_mapping_sheet()
    )

    field_template = (
        build_w6_field_observation_template()
    )

    # --------------------------------------------------------
    # 全台總覽
    # --------------------------------------------------------

    dogs = prepared["dogs"]

    overview_rows = [
        [
            "分析截止日",
            ANALYSIS_DATE.date(),
        ],
        [
            "原始犬隻筆數",
            len(dogs),
        ],
        [
            "W1～W6主要分析筆數",
            len(main_df),
        ],
        [
            "協尋暫不開放",
            len(
                groups[
                    "協尋暫不開放"
                ]
            ),
        ],
        [
            "尚未開放認養",
            len(
                groups[
                    "尚未開放"
                ]
            ),
        ],
        [
            "資料異常",
            len(
                groups[
                    "資料異常"
                ]
            ),
        ],
        [
            "入所日來源",
            prepared[
                "intake_source"
            ],
        ],
    ]

    # 只有真的有領養資料時，總覽才顯示領養相關項目。
    if has_adoption_data:
        overview_rows.extend(
            [
                [
                    "已認養且有真正領養日",
                    len(groups["已認養"]),
                ],
                [
                    "已認養但缺真正領養日",
                    len(groups["已認養缺日期"]),
                ],
                [
                    "真正領養日欄位",
                    prepared["true_adoption_column"],
                ],
            ]
        )

    if not main_df.empty:
        stay = (
            main_df["留所天數"]
            .astype(float)
        )

        overview_rows.extend(
            [
                [
                    "全台中位數留所天數",
                    round(
                        stay.median(),
                        1,
                    ),
                ],
                [
                    "全台平均留所天數",
                    round(
                        stay.mean(),
                        1,
                    ),
                ],
                [
                    "全台Q1",
                    round(
                        stay.quantile(
                            0.25
                        ),
                        1,
                    ),
                ],
                [
                    "全台Q3",
                    round(
                        stay.quantile(
                            0.75
                        ),
                        1,
                    ),
                ],
            ]
        )

    overview = pd.DataFrame(
        overview_rows,
        columns=[
            "項目",
            "結果",
        ],
    )

    # --------------------------------------------------------
    # 明細整理
    # --------------------------------------------------------

    main_detail = main_df.copy()

    if not main_detail.empty:
        main_detail = main_detail[
            detail_columns(
                main_detail
            )
        ]

    # --------------------------------------------------------
    # 寫檔
    # --------------------------------------------------------

    with pd.ExcelWriter(
        output_path,
        engine="openpyxl",
        date_format="yyyy-mm-dd",
        datetime_format="yyyy-mm-dd",
    ) as writer:

        analysis_notes.to_excel(
            writer,
            sheet_name="分析說明",
            index=False,
        )

        overview.to_excel(
            writer,
            sheet_name="全台總覽",
            index=False,
        )

        region_overview.to_excel(
            writer,
            sheet_name="地區總覽",
            index=False,
        )

        region_mapping.to_excel(
            writer,
            sheet_name="地區對照",
            index=False,
        )

        # W1～W5
        for (
            sheet_name,
            table,
        ) in week_tables.items():
            table.to_excel(
                writer,
                sheet_name=sheet_name,
                index=False,
            )

        # W3 品種資料品質／整併透明表
        w3_breed_mapping.to_excel(
            writer,
            sheet_name="W3_品種整併對照",
            index=False,
        )

        w3_unclear_detail.to_excel(
            writer,
            sheet_name="W3_未明確品種",
            index=False,
        )

        # W6
        w6_integrated.to_excel(
            writer,
            sheet_name="W6_整合",
            index=False,
        )

        field_template.to_excel(
            writer,
            sheet_name="W6_現場觀察",
            index=False,
        )

        # 領養率模式：只有真的有領養資料時才建立工作表。
        if has_adoption_data:
            adoption_notes.to_excel(
                writer,
                sheet_name="領養率模式",
                index=False,
                startrow=0,
            )

            if not adoption_table.empty:
                start_row = (
                    len(
                        adoption_notes
                    )
                    + 3
                )

                adoption_table.to_excel(
                    writer,
                    sheet_name="領養率模式",
                    index=False,
                    startrow=start_row,
                )

        # 主分析明細
        main_detail.to_excel(
            writer,
            sheet_name="主要分析明細",
            index=False,
        )

        # 分流／排除資料
        # 沒有真正領養資料時，不建立空的「已認養」相關工作表。
        sheet_map = {
            "協尋暫不開放": "協尋暫不開放",
            "尚未開放": "尚未開放",
            "資料異常": "資料異常",
        }

        if has_adoption_data:
            sheet_map = {
                "已認養": "已認養",
                "已認養缺日期": "已認養缺日期",
                **sheet_map,
            }

        for (
            group_name,
            sheet_name,
        ) in sheet_map.items():

            table = groups[
                group_name
            ].copy()

            if not table.empty:
                table = table[
                    detail_columns(
                        table
                    )
                ]

            table.to_excel(
                writer,
                sheet_name=sheet_name,
                index=False,
            )

    style_excel(
        output_path
    )


# ============================================================
# 11. 主程式
# ============================================================

def main():
    print("=" * 72)
    print(
        "ShelterLab｜六週留所天數 × 地區一次分析"
    )
    print("=" * 72)
    print()

    if not DATA_FILE.exists():
        print(
            f"找不到資料檔：{DATA_FILE.name}"
        )
        print()
        print(
            "請把 Python 檔與 COA_OpenData.csv 放在同一個資料夾。"
        )
        return

    try:
        print(
            "1/4 正在讀取 COA_OpenData.csv ..."
        )

        df = read_csv_safely(
            DATA_FILE
        )

        print(
            "2/4 正在整理犬隻、地區、日期與排除資料 ..."
        )

        prepared = prepare_dog_data(
            df
        )

        output_path = (
            unique_output_path(
                BASE_DIR,
                OUTPUT_FILENAME,
            )
        )

        print(
            "3/4 正在計算 W1～W6、全台與五區統計 ..."
        )

        print(
            "4/4 正在建立 Excel ..."
        )

        export_excel(
            prepared,
            output_path,
        )

    except Exception as error:
        print()
        print("分析失敗：")
        print(error)
        print()
        print(
            "請把這段錯誤訊息截圖傳給 ChatGPT。"
        )
        return

    groups = prepared[
        "groups"
    ]

    print()
    print("=" * 72)
    print("分析完成")
    print("=" * 72)
    print(
        f"犬隻總筆數：{len(prepared['dogs']):,}"
    )
    print(
        f"主要分析筆數：{len(prepared['main']):,}"
    )
    print(
        "協尋暫不開放："
        f"{len(groups['協尋暫不開放']):,}"
    )
    print(
        "尚未開放認養："
        f"{len(groups['尚未開放']):,}"
    )
    print(
        "資料異常："
        f"{len(groups['資料異常']):,}"
    )
    print()
    w3_included = int(
        prepared["main"]["W3_品種是否納入"]
        .fillna(False)
        .sum()
    )
    w3_excluded = int(
        (~prepared["main"]["W3_品種是否納入"]
         .fillna(False))
        .sum()
    )

    print(
        f"W3 明確品種納入：{w3_included:,} 筆"
    )
    print(
        f"W3 未明確品種排除：{w3_excluded:,} 筆（另表保留）"
    )
    print()
    print(
        "主要判讀指標：中位數留所天數"
    )
    print(
        "輔助指標：平均數、Q1、Q3、IQR、樣本數"
    )
    print()

    if prepared[
        "true_adoption_column"
    ] and prepared["dogs"]["真正領養日"].notna().any():
        print(
            "已偵測真正領養日欄位："
            f"{prepared['true_adoption_column']}"
        )
        print(
            "已認養且有真正領養日："
            f"{len(groups['已認養']):,}"
        )
    else:
        print(
            "本次資料沒有可用的真正領養日，"
            "因此略過領養率與已認養相關工作表。"
        )

    print()
    print("Excel 已輸出：")
    print(output_path)
    print()


if __name__ == "__main__":
    main()
