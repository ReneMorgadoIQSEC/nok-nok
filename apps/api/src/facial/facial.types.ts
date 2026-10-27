export interface FacialCompareResult {
  estado: number;
  descripcion: string;
  id: string | null;
  detect_face_ancla: boolean | null;
  num_face_detections: number | null;
  confidences: number[] | null;
  confidence_promedio: number;
  percent_no_faces: number;
  percent_aparicion: number;
  percent_others_apariciones: number;
}
