import { Directive, Input, Output, EventEmitter, HostListener } from "@angular/core";
import { Ingredient } from '../model/ingredient';
import { Editor } from 'primeng/editor/editor';

@Directive({ selector: '[clipboard]' })
export class ClipboardDirective {

  @Input("clipboard")
  public editorRef: Editor;

  @Output("copied")
  public copied: EventEmitter<string> = new EventEmitter<string>();

  @HostListener("click", ["$event"])
  public onClick(event: MouseEvent): void {

    event.preventDefault();
    
    const text = this.editorRef.getQuill().getText();
    if (!text)
      return;

    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", text);
      e.preventDefault();

      this.copied.emit(text);
    };

    document.addEventListener("copy", listener, false)
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }
}