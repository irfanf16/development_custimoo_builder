<template>
  <div>
    <div v-if="unauthorized" class="text-center py-5 text-danger">
      <h2>This link has expired or you are not authorized to view these samples.</h2>
    </div>
    <div v-else-if="submissionComplete" class="text-center py-5">
      <h2 class="text-success mb-4">Your response has been submitted successfully!</h2>
    </div>
    <div v-else-if="samples.length" class="sample-slider">
      <div class="d-flex align-items-center justify-content-between gap-1 py-4 px-3 m-auto">
        <div class="fs-5">
          <BIconChevronLeft :class="{ 'icon-disabled': currentSampleIndex === 0 }" @click="prevSample"
            v-if="currentSampleIndex > 0" style="cursor:pointer" />
        </div>
        <div class="sample-card">
          <div v-if="samples[currentSampleIndex].name" class="mb-2 font-weight-bold text-center">
            {{ samples[currentSampleIndex].name }}
          </div>
          <div class="sample-images">
            <div class="img-block">
              <img :src="samples[currentSampleIndex].front" alt="Front" style="cursor:pointer"
                @click="openImage(samples[currentSampleIndex].front)" />
              <div class="img-label">Front</div>
            </div>
            <div class="img-block">
              <img :src="samples[currentSampleIndex].back" alt="Back" style="cursor:pointer"
                @click="openImage(samples[currentSampleIndex].back)" />
              <div class="img-label">Back</div>
            </div>

          </div>
          <div class="actions mt-3">
            <button class="btn btn-danger" :class="{ active: sampleStatus[currentSampleIndex] === 'rejected' }"
              @click="showReject(currentSampleIndex)">
              <i class="fa fa-times"></i> Reject
            </button>
            <button class="btn btn-secondary" :class="{ active: sampleStatus[currentSampleIndex] === 'accepted' }"
              @click="acceptSample(currentSampleIndex)">
              <i class="fa fa-check"></i> Accept
            </button>
          </div>
          <div v-if="allSamplesReviewed" class="text-center mt-4">
            <button class="btn btn-primary btn-lg" @click="submitAllSamples">
              Submit
            </button>
          </div>
          <div v-if="showRejectReasonIndex === currentSampleIndex" class="p-4 text-left w-100">
            <div class="fs-4">Write your feedback</div>
            <div class="mt-2">
              <b-textarea v-model="sampleFeedback[currentSampleIndex]" placeholder="Please write your feedback here..."
                rows="5"></b-textarea>
            </div>
            <div class="mt-3">

              <button class="btn btn-link custom-cancel" @click="showRejectReasonIndex = null">
                Cancel
              </button>
              <button class="btn btn-danger btn-lg" @click="submitReject(currentSampleIndex)">
                <i class="fa fa-times"></i> Submit Rejection
              </button>
            </div>
          </div>
        </div>
        <div class="fs-5">
          <BIconChevronRight :class="{ 'icon-disabled': currentSampleIndex === samples.length - 1 }" @click="nextSample"
            v-if="currentSampleIndex < samples.length - 1" style="cursor:pointer" />
        </div>
      </div>
      <div class="text-center mt-2 sample-count">
        Sample <b>{{ currentSampleIndex + 1 }}</b> of <b>{{ samples.length }}</b>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <span>No samples to review.</span>
    </div>


  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ErrorMessages from '@/mixins/ErrorMessages';
import { BIconChevronLeft, BIconChevronRight } from 'bootstrap-vue';
import { http } from '@/httpCommon';



interface Sample {
  front: string;
  back: string;
  name: string;
  factory_product_id: string | number;
}

@Component({
  components: {
    BIconChevronLeft,
    BIconChevronRight
  }
})
export default class DirectAccessSampleApproval extends Mixins(ErrorMessages) {
  samples: Sample[] = [];
  currentSampleIndex = 0;
  showRejectReasonIndex: number | null = null;
  public sampleStatus: Array<'accepted' | 'rejected' | null> = [];
  public sampleFeedback: string[] = [];
  public submissionComplete = false;
  public unauthorized = false

  async mounted() {
    const order_item_id = this.$route.params.order_item_id;
    const auth_token = this.$route.query.auth_token;
    if (!auth_token) {
      this.unauthorized = true;
      return;
    }
    try {
      const response = await http.get(
        `admin/get-samples/${order_item_id}`,
        {
          params: {
            auth_token
          }
        }
      );
      if (
        response.data &&
        response.data.result &&
        response.data.result.order_item_activity &&
        Array.isArray(response.data.result.order_item_activity.activity_items) &&
        response.data.result.order_item_activity.activity_items.length
      ) {
        this.samples = response.data.result.order_item_activity.activity_items.map((item: any) => ({
          front: item.activity_files && item.activity_files[0] && item.activity_files[0].url
            ? `${process.env.VUE_APP_STORAGE_URL || ''}${item.activity_files[0].url}`
            : '',
          back: item.activity_files && item.activity_files[1] && item.activity_files[1].url
            ? `${process.env.VUE_APP_STORAGE_URL || ''}${item.activity_files[1].url}`
            : '',
          name: item.product_info?.name || '',
          factory_product_id: item.factory_product_id
        }));
        this.sampleStatus = Array(this.samples.length).fill(null);

        this.sampleFeedback = Array(this.samples.length).fill('');
      } else {
        this.samples = [];
        this.showToast('No samples found.', 'error');
      }
    } catch (err) {


      if (err.response && err.response.status === 403) {
        this.unauthorized = true;
      } else {
        this.samples = [];
        this.showToast(err.response?.data?.message || 'An error occurred.', 'error');
      }

    }
  }


  prevSample() {
    if (this.currentSampleIndex > 0) this.currentSampleIndex--;
    this.showRejectReasonIndex = null;
  }
  nextSample() {
    if (this.currentSampleIndex < this.samples.length - 1) this.currentSampleIndex++;
    this.showRejectReasonIndex = null;
  }
  public acceptSample(index: number) {
    this.sampleStatus.splice(index, 1, 'accepted');
    this.showRejectReasonIndex = null;
    // Move to next sample if not last
    if (this.currentSampleIndex < this.samples.length - 1) {
      this.currentSampleIndex++;
    }
  }
  public showReject(index: number) {
    this.sampleStatus.splice(index, 1, null);

    this.showRejectReasonIndex = index;
  }
  public submitReject(index: number) {
    if (!this.sampleFeedback[index]) {
      this.showToast('Please provide feedback before rejection', 'error');
      return;
    }
    this.sampleStatus.splice(index, 1, 'rejected');
    this.showRejectReasonIndex = null;
    if (this.currentSampleIndex < this.samples.length - 1) {
      this.currentSampleIndex++;
    }
  }

  get allSamplesReviewed() {
    return this.samples.length > 0 && this.sampleStatus.filter(s => s === 'accepted' || s === 'rejected').length === this.samples.length;
  }


  public async submitAllSamples() {
    const order_item_id = this.$route.params.order_item_id;
    const auth_token = this.$route.query.auth_token;
    const payload = {
      order_item_id,
      auth_token,
      approval_details: this.samples.map((sample, idx) => ({
        factory_product_id: sample.factory_product_id,
        status: this.sampleStatus[idx],
        feedback: this.sampleStatus[idx] === 'rejected' ? this.sampleFeedback[idx] : ''
      }))
    };
    try {
      await http.post('admin/approve-reject-samples', payload);
      this.showToast('Samples submitted successfully', 'success');
      this.submissionComplete = true;
    } catch (err) {
      this.showToast(err.response.data.message, 'error');
    }
  }
  public openImage(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
</script>

<style scoped>
.sample-slider {
  max-width: 1000px;
  margin: 48px auto;
  border-radius: 24px;
  padding: 48px 24px 36px 24px;
}

.sample-card {
  border-radius: 20px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
  width: 100%;
  box-sizing: border-box;
}

.sample-card .mb-2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 28px !important;
  letter-spacing: 1px;
}

.sample-images {
  display: flex;
  gap: 48px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.img-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.img-block img {
  border-radius: 18px;
  width: 350px;
  height: 350px;
  object-fit: contain;
  transition: transform 0.25s, box-shadow 0.25s;
  max-width: 90vw;
  max-height: 60vw;
}

.img-block img:hover {
  transform: scale(1.07);
}

.img-label {
  margin-top: 16px;
  font-weight: 600;
  color: #1976d2;
  font-size: 1.35rem;
  letter-spacing: 0.5px;
}

.actions {
  display: flex;
  gap: 32px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  min-width: 130px;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  transition: box-shadow 0.2s, background 0.2s;
  padding: 12px 0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.btn-danger {
  background: red;
  color: #fff;
  border: none;
}

.btn-danger:hover {
  background: #d32f2f;
}

.icon-disabled {
  opacity: 0.3;
  pointer-events: none;
}

.sample-count {
  font-size: 1.4rem;
  color: #1976d2;
  margin-top: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.p-4.text-left.w-100 {
  background: #f7fafd;
  border-radius: 14px;
  margin-top: 32px;
  padding: 32px !important;
  box-sizing: border-box;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.07);
  width: 100%;
  max-width: 600px;
}

.fs-4 {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 18px;
  text-align: center;
}

.b-textarea,
textarea {
  font-size: 1.25rem !important;
  padding: 14px !important;
  border-radius: 8px !important;
  border: 1.5px solid #90caf9 !important;
  background: #fff !important;
  color: #222 !important;
  width: 100%;
  box-sizing: border-box;
}

.btn-link.custom-cancel {
  color: #1976d2 !important;
  background: none !important;
  border: none !important;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: underline;
  padding: 0 12px;
  box-shadow: none !important;
  transition: color 0.2s;
}

.btn-link.custom-cancel:hover {
  color: #0d47a1 !important;
  text-decoration: underline;
}

.btn-danger.btn-lg {
  font-size: 1.15rem;
  padding: 12px 32px;
  font-weight: 700;
}

.actions .btn.active {
  box-shadow: 0 0 0 3px #1976d233;
  border: 2px solid #1976d2;
  font-weight: 700;
}

/* Responsive styles */
@media (max-width: 900px) {
  .sample-slider {
    padding: 32px 8px 24px 8px;
    max-width: 98vw;
  }

  .sample-card {
    padding: 24px 8px;
    min-width: 0;
  }

  .sample-images {
    gap: 24px;
  }

  .img-block img {
    width: 220px;
    height: 220px;
    max-width: 80vw;
    max-height: 50vw;
    object-fit: contain;
  }

  .p-4.text-left.w-100 {
    padding: 18px !important;
    max-width: 98vw;
  }
}

@media (max-width: 600px) {
  .sample-slider {
    padding: 8px 0 8px 0;
    border-radius: 8px;
  }

  .sample-card {
    padding: 6px 0;
    border-radius: 8px;
  }

  .sample-images {
    flex-direction: column;
    gap: 10px;
  }

  .img-block img {
    width: 96%;
    height: auto;
    max-width: 96%;
    max-height: 50vw;
  }

  .img-label {
    font-size: 0.95rem;
    margin-top: 8px;
  }

  .actions {
    gap: 8px;
  }

  .btn,
  .btn-danger,
  .btn-secondary,
  .btn-primary,
  .btn-link {
    font-size: 0.95rem !important;
    min-width: 90px !important;
    padding: 8px 0 !important;
  }

  .btn-danger.btn-lg,
  .btn-primary.btn-lg {
    font-size: 1rem !important;
    padding: 8px 18px !important;
  }

  .sample-count {
    font-size: 0.95rem;
  }

  .fs-4 {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .p-4.text-left.w-100 {
    padding: 10px !important;
    max-width: 99vw;
    font-size: 0.98rem;
  }

  .b-textarea,
  textarea {
    font-size: 1rem !important;
    padding: 8px !important;
  }
}
</style>
