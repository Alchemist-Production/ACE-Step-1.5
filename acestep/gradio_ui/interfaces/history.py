"""
Gradio UI History Tab Module
Contains the history library component definitions
"""
import gradio as gr
from acestep.gradio_ui.i18n import t

def create_history_section() -> dict:
    """Create the history tab section.

    Returns:
        Dictionary of Gradio components for event handling
    """
    with gr.Tab(t("history.tab_title")):
        gr.HTML(f"""
        <div style="text-align: center; padding: 10px; margin-bottom: 15px;">
            <h2>{t("history.header")}</h2>
            <p>{t("history.subtitle")}</p>
        </div>
        """)

        with gr.Row():
            with gr.Column(scale=3):
                refresh_history_btn = gr.Button(t("history.refresh_btn"), variant="secondary")
                # Dataframe to list files
                # Columns: Select, ID (timestamp), Filename, Date, Caption, Duration
                history_table = gr.Dataframe(
                    headers=[
                        t("history.table_headers.select"),
                        t("history.table_headers.id"),
                        t("history.table_headers.filename"),
                        t("history.table_headers.date"),
                        t("history.table_headers.caption"),
                        t("history.table_headers.duration")
                    ],
                    datatype=["bool", "str", "str", "str", "str", "str"],
                    label=t("history.table_label"),
                    interactive=True,
                    wrap=True,
                    type="array",
                )

            with gr.Column(scale=2):
                gr.HTML(f"<h3>{t('history.details_header')}</h3>")

                selected_audio = gr.Audio(label=t("history.audio_preview_label"), type="filepath", interactive=False)

                with gr.Accordion(t("history.metadata_label"), open=True):
                    selected_metadata = gr.JSON(label=t("history.metadata_label"))

                with gr.Row():
                    send_to_src_btn = gr.Button(t("history.send_to_src_btn"), interactive=False)
                    send_to_ref_btn = gr.Button(t("history.send_to_ref_btn"), interactive=False)

                with gr.Row():
                    load_params_btn = gr.Button(t("history.load_params_btn"), variant="primary", interactive=False, scale=3)
                    delete_preview_btn = gr.Button(t("history.delete_preview_btn"), variant="secondary", interactive=False, scale=1)
                    delete_btn = gr.Button(t("history.delete_selected_btn"), variant="stop", interactive=True, scale=1)

                # Hidden state to store the full path of the selected item
                selected_item_path = gr.State(None)
                status_output = gr.Textbox(label=t("history.status_label"), interactive=False, visible=True)

    return {
        "refresh_history_btn": refresh_history_btn,
        "history_table": history_table,
        "selected_audio": selected_audio,
        "selected_metadata": selected_metadata,
        "send_to_src_btn": send_to_src_btn,
        "send_to_ref_btn": send_to_ref_btn,
        "load_params_btn": load_params_btn,
        "delete_btn": delete_btn,
        "delete_preview_btn": delete_preview_btn,
        "selected_item_path": selected_item_path,
        "status_output": status_output,
    }
