#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "bo-600-cau-hoi.json"

FIXES: dict[int, dict] = {
    12: {
        "question": "Người điều khiển phương tiện tham gia giao thông đường bộ gồm những đối tượng nào dưới đây?",
        "options": [
            "Người điều khiển xe cơ giới, người điều khiển xe thô sơ.",
            "Người điều khiển xe máy chuyên dùng.",
            "Cả hai ý trên.",
        ],
        "answer": 2,
        "explanation": "Theo quy định, người điều khiển gồm người điều khiển xe cơ giới, xe thô sơ và xe máy chuyên dùng; nên đáp án đúng là phương án gộp cả hai.",
    },
    23: {
        "question": "Hành vi của người điều khiển xe ô tô và các loại xe tương tự khi tham gia giao thông đường bộ mà trong cơ thể có chất ma túy thì bị áp dụng hình thức xử phạt vi phạm hành chính nào dưới đây?",
        "options": [
            "Bị phạt tiền.",
            "Bị tước giấy phép lái xe.",
            "Cả hai ý trên.",
        ],
        "answer": 2,
        "explanation": "Theo quy định xử phạt, có thể áp dụng cả phạt tiền và tước giấy phép lái xe tùy mức độ; đáp án đúng là cả hai hình thức.",
    },
    103: {
        "question": "Người điều khiển phương tiện tham gia giao thông trong hầm đường bộ ngoài việc phải tuân thủ các quy tắc giao thông còn phải thực hiện những quy định nào dưới đây?",
        "options": [
            "Xe cơ giới, xe máy chuyên dùng phải bật đèn chiếu gần; xe thô sơ phải bật đèn hoặc có vật phát sáng báo hiệu; không dừng xe, đỗ xe trong hầm đường bộ; trường hợp gặp sự cố kỹ thuật hoặc bất khả kháng khác buộc phải dừng xe, đỗ xe, người lái xe, người điều khiển xe máy chuyên dùng phải đưa xe vào vị trí dừng xe, đỗ xe khẩn cấp, nếu không di chuyển được, phải có báo hiệu bằng đèn khẩn cấp và đặt biển hoặc đèn cảnh báo về phía sau xe khoảng cách bảo đảm an toàn.",
            "Xe cơ giới, xe máy chuyên dùng phải bật đèn chiếu xa; được dừng xe, đỗ xe khi cần thiết.",
            "Phải cho xe chạy trên một làn đường và chỉ chuyển làn ở nơi được phép; được quay đầu xe, lùi xe khi cần thiết.",
        ],
        "answer": 0,
        "explanation": "Trong hầm phải dùng đèn chiếu gần, có báo hiệu khi sự cố, không dừng đỗ tùy tiện; các phương án còn lại sai về đèn và hành vi dừng đỗ.",
    },
    127: {
        "question": "Người có Giấy phép lái xe ô tô hạng B được phép điều khiển loại xe nào dưới đây?",
        "options": [
            "Xe ô tô chở người đến 08 chỗ (không kể chỗ của người lái xe).",
            "Xe ô tô tải và ô tô chuyên dùng có khối lượng toàn bộ theo thiết kế đến 3.500 kg.",
            "Cả hai ý trên.",
        ],
        "answer": 2,
        "explanation": "GPLX hạng B cho phép điều khiển ô tô chở người đến 9 chỗ và ô tô tải/chuyên dùng đến 3.500 kg; đáp án gộp đủ hai phạm vi.",
    },
    132: {
        "question": "Người có Giấy phép lái xe hạng D được điều khiển loại xe nào dưới đây?",
        "options": [
            "Xe ô tô chở người (kể cả xe buýt) trên 29 chỗ (không kể chỗ của người lái xe); xe ô tô chở người giường nằm; các loại xe ô tô chở người quy định cho giấy phép lái xe hạng D kéo rơ moóc có khối lượng toàn bộ theo thiết kế đến 750 kg.",
            "Xe ô tô chở người (kể cả xe buýt) trên 16 chỗ (không kể chỗ của người lái xe) đến 29 chỗ (không kể chỗ của người lái xe).",
            "Các loại xe ô tô quy định cho giấy phép lái xe hạng C kéo rơ moóc có khối lượng toàn bộ theo thiết kế trên 750 kg; xe ô tô đầu kéo kéo sơ mi rơ moóc.",
            "Ý 1 và ý 2.",
        ],
        "answer": 3,
        "explanation": "Hạng D bao gồm xe khách chở người theo quy định của hạng D (bao gồm trên 29 chỗ, giường nằm, kéo rơ moóc đến 750 kg) và phạm vi từ 16 đến 29 chỗ; phương án 3 gắn với hạng C/E.",
    },
    169: {
        "question": "Trong hoạt động vận tải đường bộ, các hành vi nào dưới đây bị nghiêm cấm?",
        "options": [
            "Vận chuyển hàng hóa cấm lưu hành.",
            "Vận chuyển trái phép hoặc không thực hiện đầy đủ các quy định của pháp luật về vận chuyển hàng hóa nguy hiểm.",
            "Vận chuyển động vật hoang dã.",
            "Cả ba ý trên.",
        ],
        "answer": 3,
        "explanation": "Hàng cấm, hàng nguy hiểm không đúng quy định và động vật hoang dã đều bị nghiêm cấm trong vận tải đường bộ.",
    },
    181: {
        "question": "Người lái xe kinh doanh vận tải khi thực hiện tốt việc rèn luyện, nâng cao trách nhiệm, đạo đức nghề nghiệp sẽ thu được kết quả như thế nào dưới đây?",
        "options": [
            "Được khách hàng, xã hội tôn trọng; được đồng nghiệp quý mến, giúp đỡ; được doanh nghiệp tin dùng và đóng góp nhiều cho xã hội; thu hút được khách hàng, góp phần quan trọng trong xây dựng thương hiệu, kinh doanh có hiệu quả cao.",
            "Được cộng điểm vào giấy phép lái xe.",
            "Cả hai ý trên.",
        ],
        "answer": 0,
        "explanation": "Đạo đức nghề nghiệp tốt mang lại uy tín và hiệu quả kinh doanh; không có quy định cộng điểm GPLX vì lý do này.",
    },
    184: {
        "question": "Người lái xe ô tô vận chuyển hành khách phải có những phẩm chất, đạo đức nghề nghiệp gì dưới đây?",
        "options": [
            "Phải có thái độ lịch sự, tôn trọng, thân mật với hành khách; giúp đỡ những người có hoàn cảnh khó khăn, người già, người khuyết tật, phụ nữ có thai, có con nhỏ và trẻ em.",
            "Luôn tu dưỡng bản thân, có lối sống lành mạnh, khiêm tốn, có tác phong làm việc công nghiệp, không tham gia vào các tệ nạn xã hội; tôn trọng người cùng tham gia giao thông đường bộ và có ý thức bảo vệ môi trường.",
            "Cả hai ý trên.",
        ],
        "answer": 2,
        "explanation": "Lái xe vận khách cần cả thái độ với khách và chuẩn mực đạo đức, bảo vệ môi trường; đáp án đầy đủ là cả hai.",
    },
    190: {
        "question": "Người lái xe có văn hóa giao thông khi tham gia giao thông phải tuân thủ những quy định nào dưới đây?",
        "options": [
            "Điều khiển xe đi trên phần đường, làn đường có ít phương tiện tham gia giao thông, chỉ đội mũ bảo hiểm ở nơi có biển báo bắt buộc đội mũ bảo hiểm.",
            "Chấp hành hiệu lệnh, chỉ dẫn của người điều khiển giao thông, quy định về tốc độ, tín hiệu đèn, biển báo hiệu, vạch kẻ đường khi lái xe; nhường đường cho người đi bộ, người già, trẻ em, người khuyết tật.",
        ],
        "answer": 1,
        "explanation": "Văn hóa giao thông là chấp hành luật, tín hiệu và nhường đường cho đối tượng yếu thế; không chọn làn ít xe hay mũ chỉ khi có biển.",
    },
    210: {
        "question": "Khi quay đầu xe, người lái xe cần phải quan sát và thực hiện các thao tác nào để bảo đảm an toàn giao thông?",
        "options": [
            "Quan sát biển báo hiệu để biết nơi được phép quay đầu; quan sát kỹ địa hình nơi chọn để quay đầu; lựa chọn quỹ đạo quay đầu xe cho thích hợp; quay đầu xe với tốc độ thấp; thường xuyên báo tín hiệu để người, các phương tiện xung quanh được biết; nếu quay đầu xe ở nơi nguy hiểm thì đưa đầu xe về phía nguy hiểm, đưa đuôi xe về phía an toàn.",
            "Quan sát biển báo hiệu để biết nơi được phép quay đầu; quan sát kỹ địa hình nơi chọn để quay đầu; lựa chọn quỹ đạo quay đầu xe; quay đầu xe với tốc độ tối đa; thường xuyên báo tín hiệu để người, các phương tiện xung quanh được biết; nếu quay đầu xe ở nơi nguy hiểm thì đưa đuôi xe về phía nguy hiểm và đầu xe về phía an toàn.",
        ],
        "answer": 0,
        "explanation": "Quay đầu chậm, đưa đầu xe về phía nguy hiểm để còn quan sát phần nguy hiểm; không quay tốc độ tối đa hay đưa đuôi về phía nguy hiểm.",
    },
    214: {
        "question": "Khi xuống dốc, muốn dừng xe, người lái xe cần thực hiện các thao tác nào để bảo đảm an toàn?",
        "options": [
            "Có tín hiệu rẽ phải, điều khiển xe sát vào lề đường bên phải; đạp phanh sớm và mạnh hơn lúc dừng xe trên đường bằng để xe đi với tốc độ chậm đến mức dễ dàng dừng lại được; về số 1, đạp 1/2 ly hợp (côn) cho xe đến chỗ dừng; khi xe đã dừng, về số không (N), đạp phanh chân, sử dụng phanh đỗ.",
            "Có tín hiệu rẽ phải, điều khiển xe sát vào lề đường bên trái; đạp hết hành trình ly hợp (côn) và nhả bàn đạp ga để xe đi với tốc độ chậm đến mức dễ dàng dừng lại được tại chỗ dừng; khi xe đã dừng, đạp và giữ phanh chân.",
            "Có tín hiệu rẽ trái, điều khiển xe sát vào lề đường bên phải; đạp phanh sớm và mạnh hơn lúc dừng xe trên đường bằng để xe đi với tốc độ chậm đến mức dễ dàng dừng lại được; về số không (N) để xe đi đến chỗ dừng, khi xe đã dừng, sử dụng phanh đỗ.",
        ],
        "answer": 0,
        "explanation": "Trên dốc dừng xe bên phải, điều chỉnh phanh côn số và phanh đỗ đúng; không dừng sát lề trái hay chỉ dùng số N khi lăn.",
    },
    264: {
        "question": "Phương pháp kiểm tra mức dầu bôi trơn động cơ nào dưới đây là đúng?",
        "options": [
            "Kiểm tra que thăm dầu trên các-te. Quan sát vệt dầu trên que thăm, mức dầu này phải nằm ở mức tối đa được thể hiện trên que thăm.",
            "Rút que thăm dầu trên các-te. Quan sát vệt dầu trên que thăm, mức dầu này phải nằm ở mức tối thiểu được thể hiện trên que thăm.",
            "Rút que thăm dầu trên các-te, lau sạch que thăm sau đó cắm vào các-te và rút ra quan sát vệt dầu trên que thăm, mức dầu phải nằm trong khoảng vạch mức tối thiểu và tối đa được thể hiện trên que thăm.",
        ],
        "answer": 2,
        "explanation": "Phải rút que, lau, cắm lại rồi đọc mức giữa min và max; chỉ nhìn một lần hoặc chỉ tối đa/tối thiểu là đều sai quy trình.",
    },
    286: {
        "question": "Khi động cơ ô tô đã khởi động, bảng đồng hồ xuất hiện ký hiệu như hình vẽ dưới đây, báo hiệu tình trạng như thế nào của xe ô tô?",
        "options": [
            "Nhiệt độ nước làm mát động cơ quá ngưỡng cho phép.",
            "Áp suất lốp không đủ.",
            "Đang hãm phanh tay.",
            "Cần kiểm tra động cơ.",
        ],
        "answer": 0,
        "explanation": "Theo bộ đề chuẩn: ký hiệu đèn/nhiệt kế nước làm mát (cảnh báo quá nhiệt). Cần đối chiếu hình trong đề; nếu là biểu tượng nhiệt độ nước làm mát thì chọn mục báo quá nhiệt.",
    },
    353: {
        "question": "Biển nào báo hiệu khoảng cách thực tế từ nơi đặt biển đến nơi cần giữ cự ly tối thiểu giữa hai xe?",
        "options": [
            "Biển 1.",
            "Biển 2.",
            "Cả hai biển.",
        ],
        "answer": 1,
        "explanation": "Biển phụ 502 (khoảng cách đến đối tượng báo hiệu) thể hiện khoảng cách thực tế từ vị trí đặt biển đến điểm bắt buộc giữ cự ly; biển 501 là phạm vi tác dụng của biển (chiều dài đoạn đường). Đối chiếu hình trong đề.",
    },
}


def auto_explanation(item: dict) -> str:
    a = item.get("answer")
    opts = item.get("options") or []
    if a is None or not opts or a < 0 or a >= len(opts):
        return ""
    correct = (opts[a] or "").strip()
    if not correct:
        return ""
    return (
        f"Đáp án đúng là phương án {a + 1}. "
        f"{correct}"
    )


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    by_id = {x["id"]: x for x in data}

    for qid, patch in FIXES.items():
        if qid not in by_id:
            raise SystemExit(f"Missing id {qid} in JSON")
        row = by_id[qid]
        for k, v in patch.items():
            row[k] = v

    for row in data:
        if row["id"] in FIXES:
            continue
        if row.get("answer") is None:
            continue
        if (row.get("explanation") or "").strip():
            continue
        row["explanation"] = auto_explanation(row)

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    n_empty = sum(1 for x in data if not (x.get("explanation") or "").strip() and x.get("answer") is not None)
    null_ans = [x["id"] for x in data if x.get("answer") is None]
    print(f"Updated {JSON_PATH}")
    print(f"Remaining empty explanation (with answer): {n_empty}")
    print(f"Null answer ids: {null_ans}")


if __name__ == "__main__":
    main()
