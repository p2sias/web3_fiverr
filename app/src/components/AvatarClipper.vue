<template>
  <div class="clipper-box" style="width=100%;">
    <clipper-preview @click="apply()" v-if="needToCrop" name="preview" class="my-clipper clip-prev"></clipper-preview>
    <v-file-input
      id="avatarclipper"
      accept="image/png, image/jpeg, image/bmp"
      prepend-icon="mdi-camera"
      :append-icon="img && needToCrop ? 'mdi-check': undefined"
      @change="onChangePhoto($event)"
      @click:clear="cancel()"
      @click:append="apply()"
    />
    <clipper-fixed
      v-if="needToCrop"
      class="my-clipper md-6"
      preview="preview"
      :src="img"
      :round="true"
      ref="clipper"
    >
      <div class="placeholder" slot="placeholder">{{$t('no_image')}}</div>
    </clipper-fixed>
  </div>
</template>


<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        let canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL());
      };
    };
    reader.onerror = error => reject(error);
  });

const getImgSize = (file: File): Promise<Array<number>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        let size = [0, 0];
        size[0] = img.width;
        size[1] = img.height;
        resolve(size);
      };
    };
    reader.onerror = error => reject(error);
  });
};

@Component({})
export default class AvatarClipper extends Vue {
  private needToCrop: boolean = false;
  private needPrev: any;
  private img: string | null = null;

  private apply(): void {
    const clipper: any = this.$refs.clipper;
    if (clipper) {
      const canvas = clipper.clip();
      let res = canvas.toDataURL();
      this.img = res;
      this.needToCrop = false;
      this.$emit("clipped", this.img);
    }
  }

  private cancel(): void {
    this.needToCrop = false;
    this.img = "";
    this.$emit("close");
  }

  private async onChangePhoto(file: File): Promise<void> {
    if (file) {
      let size = await getImgSize(file);
      if (size[0] > 240 || size[1] > 240 || size[0] != size[1]) {
        this.needToCrop = true;
        this.$emit("needCrop");
      } else this.needToCrop = false;
      this.img = file ? await toBase64(file) : "";
      if(!this.needToCrop) this.$emit("clipped", this.img);
    } else this.needToCrop = false;
  }
}
</script>

<style lang="scss">
.clip-prev {
  width: 100px;
}

div.preview div.wrap {
  border-radius: 50%;
}

</style>