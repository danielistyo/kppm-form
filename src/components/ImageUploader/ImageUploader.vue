<template>
  <div class="image-uploader">
    <file-upload
      ref="fileUpload"
      :class="`file-upload${randId}`"
      chooseLabel="Pilih"
      cancelLabel="Batal"
      accept="image/png,image/jpg,image/webp"
      :showUploadButton="false"
      multiple
      customUpload
      auto
      @uploader="handleUpload"
    />

    <progress-spinner v-if="isLoading" class="image-uploader__loading" />
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, ref, toRef, unref, watchEffect } from 'vue';
import FileUpload from 'primevue/fileupload';
import { resizeImg } from '@/helpers/image';
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import ProgressSpinner from 'primevue/progressspinner';

export default defineComponent({
  name: 'ImageUploader',
  components: {
    FileUpload,
    ProgressSpinner,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const randId = ref(Math.floor(Math.random() * (100 - 1 + 1) + 1));
    const uploadRef = firebase
      .storage()
      .ref()
      .child('uploads/');
    const isLoading = ref(false);
    const fileUpload = ref<null | { files: Array<string> }>(null);

    // create image element in ImageUploader when there is initial value
    watchEffect(() => {
      // Clear files data of FileUpload component,
      // then all selected files will be clear.
      // This is hacked of FileUpload component.
      // Because we will handle selected file by our selves
      if (fileUpload.value) fileUpload.value.files = [];

      // start to handle selected files
      if (toRef(props, 'modelValue').value && Array.isArray(props.modelValue)) {
        const buttonRemoveClickHandler = async (e: any) => {
          isLoading.value = true;
          const nameFile: string | null =
            e.target.getAttribute('data-name') ||
            e.target.parentElement.getAttribute('data-name') ||
            '';

          if (nameFile) {
            emit(
              'update:modelValue',
              props.modelValue.filter((url) => !url.includes(nameFile)),
            );
            document.getElementById(`existingImage${nameFile}`)?.remove();
            isLoading.value = false;
          }
        };
        const getSelectedFileTemplate = (src: string) => {
          const res = src.match(/(?<=%2F)(.*)(?=\?alt=media)/);
          const filename = res?.length ? res[0] : '';

          return `
              <div id="existingImage${filename}" class="p-fileupload-row">
                <div>
                  <img role="presentation" alt="${filename}" width="50" src="${src}"/>
                </div>
                <div>${filename}</div>
                <div></div>
                <div>
                  <button
                    class="p-button p-component p-button-icon-only existing-image-remove-button"
                    type="button"
                    data-name="${filename}"
                  >
                    <span class="pi pi-times p-button-icon"></span>
                    <span class="p-button-label">&nbsp;</span>
                  </button>
                </div>
              </div>
              `;
        };
        nextTick(() => {
          const wrapperSelectedFile = document.querySelector('.p-fileupload-content');

          // remove all children first
          if (wrapperSelectedFile) {
            for (let i = 0; i < wrapperSelectedFile.children.length; i++) {
              wrapperSelectedFile.children?.item(i)?.remove();
            }
          }
          // then add all children
          props.modelValue.forEach((url) => {
            wrapperSelectedFile?.insertAdjacentHTML('afterbegin', getSelectedFileTemplate(url));

            document
              .querySelector('.existing-image-remove-button')
              ?.addEventListener('click', buttonRemoveClickHandler);
          });
        });
      }
    });

    const handleUpload = async ({ files }: { files: Array<File & { objectURL: Blob }> }) => {
      isLoading.value = true;
      // get last image only
      const image = files[files.length - 1];
      const arrNames = image.name.split('.');
      const fileType = arrNames[arrNames.length - 1];
      const nameFile = dayjs().unix() + '.' + fileType;
      const imageRef = uploadRef.child(nameFile);

      // resize image first
      const blob =
        image.size > 500000 ? await resizeImg(image) : new Blob([image], { type: image.type });

      // upload image
      await imageRef.put(blob);
      const url = await imageRef.getDownloadURL();

      emit('update:modelValue', [...props.modelValue, url]);

      // set data name to remove button. It will be used to remove image on firebase when remove button is clicked
      nextTick(() => {
        let newRemoveButton = document?.querySelector(
          `.file-upload${unref(randId)} .p-fileupload-files > :last-child button`,
        );

        newRemoveButton?.setAttribute('data-name', nameFile);
        newRemoveButton?.addEventListener('click', async (e: any) => {
          isLoading.value = true;
          const nameFile: string | null =
            e.target.getAttribute('data-name') ||
            e.target.parentElement.getAttribute('data-name') ||
            '';

          if (nameFile) {
            await uploadRef.child(nameFile).delete();

            emit(
              'update:modelValue',
              props.modelValue.filter((url) => !url.includes(nameFile)),
            );
            isLoading.value = false;
          }
          // remove reference so that garbage collector can clear in memory
          newRemoveButton = null;
        });
      });
      isLoading.value = false;
    };

    const handleClear = async () => {
      isLoading.value = true;
      let newRemoveButtons: NodeListOf<Element> | null = document?.querySelectorAll(
        `.file-upload${unref(randId)} .p-fileupload-files button`,
      );
      await new Promise((resolve) => {
        newRemoveButtons?.forEach(async (button, key) => {
          const nameFile: string | null =
            button?.getAttribute('data-name') ||
            button?.parentElement?.getAttribute('data-name') ||
            '';

          if (nameFile) {
            await uploadRef.child(nameFile).delete();
          }

          // loop reachs last key
          if (newRemoveButtons && key === newRemoveButtons.length - 1) {
            resolve(null);
          }
        });
      });
      // remove reference so that garbage collector can clear in memory
      newRemoveButtons = null;
      emit('update:modelValue', []);
      isLoading.value = false;
    };

    return { handleUpload, handleClear, randId, isLoading, fileUpload };
  },
});
</script>

<style lang="scss" src="./ImageUploader.scss" scoped />
