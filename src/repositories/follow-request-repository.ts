import { MastoConfig } from '../config';
import { version } from '../decorators';
import { Account } from '../entities';
import { Http } from '../http';
import { Paginator } from '../paginator';
import { IterableRepository } from './iterable-repository';
import { DefaultPaginationParams } from './repository';

export class FollowRequestRepository extends IterableRepository<Account> {
  constructor(
    private readonly http: Http,
    readonly version: string,
    readonly config: MastoConfig,
  ) {
    super();
  }

  /**
   * Pending Follows
   * @param params Parameters
   * @return Array of Account
   * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/
   */
  @version({ since: '0.0.0' })
  getIterator(
    params?: DefaultPaginationParams,
  ): Paginator<DefaultPaginationParams, Account[]> {
    return new Paginator(this.http, `/api/v1/follow_requests`, params);
  }

  /**
   * Accept Follow
   * @param id ID of the account in the database
   * @return Relationship
   * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/
   */
  @version({ since: '0.0.0' })
  authorize(id: string) {
    return this.http.post(`/api/v1/follow_requests/${id}/authorize`);
  }

  /**
   * Reject Follow
   * @param id ID of the account in the database
   * @return Relationship
   * @see https://docs.joinmastodon.org/methods/accounts/follow_requests/
   */
  @version({ since: '0.0.0' })
  reject(id: string) {
    return this.http.post(`/api/v1/follow_requests/${id}/reject`);
  }
}
