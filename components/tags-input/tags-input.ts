import { Component, Input, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NgModel, NG_VALUE_ACCESSOR, Validators, ValidatorFn, FormControl } from '@angular/forms';

@Component({
  selector: 'lsu-tagsInput',
  styles: [
    `
      .tags-input.invalid {
        border-top: 2px solid #DB2828 !important;
      }

      .tags-input .ui.label.transition.visible {
          height: 25px;
          display: inline-block !important;
      }

      .tags-input .ui.input {
          display: inline-block;
          width: auto;
      }

      .tags-input .ui.input input {
          height: 30px;
          padding: 0 5px;
          border: none;
      }

      .tags-input .ui.input input:focus {
          border-radius: inherit;
      }

      .deleteTarget:hover,
      .deleteTarget {
          background-color: #FBBD08 !important;
          color: white !important;
      }
    `
  ],
  template:  `
    <div class="ui fluid dropdown selection multiple tags-input" [class.invalid]="tagInputCtrl.invalid && submitted" tabindex="-1" (click)="tagsInput.focus()" (keyup)="topKeyup($event)">
      <a class="ui label transition visible" [class.deleteTarget]="delTarget == tag" *ngFor="let tag of tags; let i = index; let last = last;"
        (click)="setDeltarget(tag, $event)">
        {{ tag }}
        <i class="delete icon" (click)="remove(i, $event)"></i>
      </a>
      <div class="ui input">
        <input type="text" autocomplete="off" [formControl]="tagInputCtrl" [attr.placeholder]="placeholder" #tagsInput (focus)="tagInputOnFocus($event)" (keyup)="tagInputKeyUp($event)"
          (keydown)="tagInputKeyDown($event)" (keypress)="tagInputKeyPress($event)">
      </div>
    </div>
    <p style="color: #DB2828" *ngIf="tagInputCtrl.invalid && submitted"> {{ invalidMsg }}</p>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagsInputComponent),
    multi: true
  }]
})
export class TagsInputComponent implements ControlValueAccessor {

  @Input()
  placeholder: string = 'Add Tag';

  @Input()
  invalidMsg: string = 'Value is invalid';

  @Input()
  validators: Array<ValidatorFn>;

  private tags: Array<string>;
  private delTarget: string;
  private rootEle: HTMLDivElement;
  private isBackspaceDown: boolean = false;

  private tagInputCtrl: FormControl;
  private submitted: boolean = false;

  private onChange: Function;
  private onTouched: Function;

  get value(): Array<any> {
    return this.tags;
  }

  set value(v: Array<any>) {
    this.tags = v || [];
  }

  constructor(private element: ElementRef) {

  }

  ngOnInit() {
    this.tagInputCtrl = new FormControl('', Validators.compose(this.validators));
  }

  ngAfterViewInit() {
    this.rootEle = this.element.nativeElement.children[0];
  }

  writeValue(value: any): void {
    this.tags = value || [];
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  private topKeyup(event: any) {
    if (event.keyCode === 8 && this.delTarget) {
      let index = this.tags.indexOf(this.delTarget);
      if (index !== -1) {
        this.tags.splice(index, 1);
      }
      this.delTarget = '';
    }
  }

  private setDeltarget(tag: string, evnet: any) {
    this.delTarget = tag;
    event.stopPropagation();
  }

  private remove(index: number, evnet: any) {
    this.tags.splice(index, 1);
    event.stopPropagation();
  }

  private tagInputOnFocus(event: any) {    
    this.submitted = !!event.srcElement.value;
    this.delTarget = '';
  }

  private tagInputKeyPress(event: any) {
    let value = event.srcElement.value;
    if (event.keyCode === 13 && value) {
      this.submitted = true;            
      if (this.tagInputCtrl.valid) {
        this.tags.push(value);
        event.srcElement.value = '';
        this.submitted = false;
      }
      event.preventDefault();
    }
  }

  private tagInputKeyDown(event: any) {
    let value = event.srcElement.value;
    if (event.keyCode === 8 && !value) {
      this.isBackspaceDown = true;
    } else {
      this.isBackspaceDown = false;
    }
  }

  private tagInputKeyUp(event: any) {
    let value = event.srcElement.value;
    if (event.keyCode === 8 && !value && this.tags.length > 0 && this.isBackspaceDown) {
      this.delTarget = this.tags[this.tags.length - 1];
      console.log(this.delTarget)
      event.stopPropagation();
      this.rootEle.focus();
    }
  }
}